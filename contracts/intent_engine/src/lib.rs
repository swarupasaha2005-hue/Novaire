#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env};

use soroban_sdk::token;

#[soroban_sdk::contractclient(name = "VaultClient")]
pub trait VaultInterface {
    fn deposit(env: Env, from: Address, amount: i128) -> i128;
}

#[soroban_sdk::contractclient(name = "TokenizerClient")]
pub trait TokenizerInterface {
    fn mint_pt_yt(env: Env, to: Address, amount: i128) -> (i128, i128);
}

#[soroban_sdk::contractclient(name = "MarketplaceClient")]
pub trait MarketplaceInterface {
    fn swap_yt_for_underlying(env: Env, seller: Address, yt_amount: i128, min_underlying_out: i128) -> i128;
    fn swap_pt_for_underlying(env: Env, seller: Address, pt_amount: i128, min_underlying_out: i128) -> i128;
    fn get_implied_rate(env: Env) -> i128;
    fn get_twap_rate(env: Env) -> i128;
}

#[soroban_sdk::contractclient(name = "YtTokenClient")]
pub trait YtTokenInterface {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
}

#[soroban_sdk::contractclient(name = "PtTokenClient")]
pub trait PtTokenInterface {
    fn balance(env: Env, id: Address) -> i128;
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireIntentError {
    Paused = 1,
    Unauthorized = 2,
    ZeroAmount = 3,
    RateTooLow = 4,
    IntentFailed = 5,
    AlreadyInitialized = 6,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Vault,
    Tokenizer,
    Marketplace,
    SyWrapper,
    Underlying,
    PtToken,
    YtToken,
    Paused,
    UserIntents(Address), // map: Address -> IntentRecord
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct IntentRecord {
    pub deposited_amount: i128,
    pub pt_held: i128,
    pub yt_sold: i128,
    pub implied_rate_at_entry: i128,
    pub maturity_ledger: u32,
    pub created_ledger: u32,
}

#[contract]
pub struct IntentEngine;

#[contractimpl]
impl IntentEngine {
    pub fn initialize(
        env: Env,
        admin: Address,
        vault: Address,
        tokenizer: Address,
        marketplace: Address,
        sy_wrapper: Address,
        underlying: Address,
        pt_token: Address,
        yt_token: Address,
    ) -> Result<(), NovaireIntentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(NovaireIntentError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Vault, &vault);
        env.storage().instance().set(&DataKey::Tokenizer, &tokenizer);
        env.storage().instance().set(&DataKey::Marketplace, &marketplace);
        env.storage().instance().set(&DataKey::SyWrapper, &sy_wrapper);
        env.storage().instance().set(&DataKey::Underlying, &underlying);
        env.storage().instance().set(&DataKey::PtToken, &pt_token);
        env.storage().instance().set(&DataKey::YtToken, &yt_token);
        env.storage().instance().set(&DataKey::Paused, &false);

        Ok(())
    }

    pub fn pause(env: Env) -> Result<(), NovaireIntentError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &true);
        Ok(())
    }

    pub fn unpause(env: Env) -> Result<(), NovaireIntentError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    pub fn get_current_best_rate(env: Env) -> i128 {
        let marketplace_addr: Address = env.storage().instance().get(&DataKey::Marketplace).unwrap();
        let marketplace_client = MarketplaceClient::new(&env, &marketplace_addr);
        marketplace_client.get_twap_rate()
    }

    pub fn get_user_intent(env: Env, user: Address) -> IntentRecord {
        env.storage().persistent().get(&DataKey::UserIntents(user)).unwrap()
    }

    pub fn execute_fixed_yield_intent(
        env: Env,
        user: Address,
        usdc_amount: i128,
        min_implied_rate: i128,
        _maturity_ledger: u32,
    ) -> Result<IntentRecord, NovaireIntentError> {
        user.require_auth();

        let paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap();
        if paused {
            return Err(NovaireIntentError::Paused);
        }

        if usdc_amount <= 0 {
            return Err(NovaireIntentError::ZeroAmount);
        }

        let marketplace_addr: Address = env.storage().instance().get(&DataKey::Marketplace).unwrap();
        let marketplace_client = MarketplaceClient::new(&env, &marketplace_addr);

        let current_twap = marketplace_client.get_twap_rate();
        if current_twap < min_implied_rate {
            return Err(NovaireIntentError::RateTooLow);
        }

        let underlying_addr: Address = env.storage().instance().get(&DataKey::Underlying).unwrap();
        let underlying_client = token::Client::new(&env, &underlying_addr);

        // Step 1: Pull usdc_amount from user to Intent Engine
        let intent_engine_addr = env.current_contract_address();
        underlying_client.transfer(&user, &intent_engine_addr, &usdc_amount);

        // Step 2: Call vault.deposit(intent_engine_address, usdc_amount) -> sy_shares
        let vault_addr: Address = env.storage().instance().get(&DataKey::Vault).unwrap();
        let vault_client = VaultClient::new(&env, &vault_addr);
        let sy_shares = vault_client.deposit(&intent_engine_addr, &usdc_amount);

        // Step 3: Call tokenizer.mint_pt_yt(intent_engine_address, sy_shares)
        let tokenizer_addr: Address = env.storage().instance().get(&DataKey::Tokenizer).unwrap();
        let tokenizer_client = TokenizerClient::new(&env, &tokenizer_addr);
        let (pt_amount, yt_amount) = tokenizer_client.mint_pt_yt(&intent_engine_addr, &sy_shares);

        // Step 4: Call marketplace.swap_yt_for_underlying
        let underlying_from_yt = marketplace_client.swap_yt_for_underlying(&intent_engine_addr, &yt_amount, &1);

        // Step 5: Transfer PT tokens to user
        let pt_token_addr: Address = env.storage().instance().get(&DataKey::PtToken).unwrap();
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);
        pt_client.transfer(&intent_engine_addr, &user, &pt_amount);

        // Step 6: Transfer underlying_from_yt back to user
        underlying_client.transfer(&intent_engine_addr, &user, &underlying_from_yt);

        let record = IntentRecord {
            deposited_amount: usdc_amount,
            pt_held: pt_amount,
            yt_sold: yt_amount,
            implied_rate_at_entry: current_twap,
            maturity_ledger: _maturity_ledger,
            created_ledger: env.ledger().sequence(),
        };

        env.storage().persistent().set(&DataKey::UserIntents(user.clone()), &record);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "intent_executed"), user),
            (usdc_amount, pt_amount, underlying_from_yt, current_twap),
        );

        Ok(record)
    }

    pub fn execute_yield_speculation_intent(
        env: Env,
        user: Address,
        usdc_amount: i128,
        min_yt_out: i128,
    ) -> Result<i128, NovaireIntentError> {
        user.require_auth();

        let paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap();
        if paused {
            return Err(NovaireIntentError::Paused);
        }

        if usdc_amount <= 0 {
            return Err(NovaireIntentError::ZeroAmount);
        }

        let underlying_addr: Address = env.storage().instance().get(&DataKey::Underlying).unwrap();
        let underlying_client = token::Client::new(&env, &underlying_addr);

        let intent_engine_addr = env.current_contract_address();

        // Step 1: Pull usdc_amount from user
        underlying_client.transfer(&user, &intent_engine_addr, &usdc_amount);

        // Step 2: vault.deposit -> sy_shares
        let vault_addr: Address = env.storage().instance().get(&DataKey::Vault).unwrap();
        let vault_client = VaultClient::new(&env, &vault_addr);
        let sy_shares = vault_client.deposit(&intent_engine_addr, &usdc_amount);

        // Step 3: tokenizer.mint_pt_yt -> (pt_amount, yt_amount)
        let tokenizer_addr: Address = env.storage().instance().get(&DataKey::Tokenizer).unwrap();
        let tokenizer_client = TokenizerClient::new(&env, &tokenizer_addr);
        let (pt_amount, yt_amount) = tokenizer_client.mint_pt_yt(&intent_engine_addr, &sy_shares);

        if yt_amount < min_yt_out {
            return Err(NovaireIntentError::IntentFailed);
        }

        // Step 4: marketplace.swap_pt_for_underlying -> underlying_from_pt
        let marketplace_addr: Address = env.storage().instance().get(&DataKey::Marketplace).unwrap();
        let marketplace_client = MarketplaceClient::new(&env, &marketplace_addr);
        let underlying_from_pt = marketplace_client.swap_pt_for_underlying(&intent_engine_addr, &pt_amount, &1);

        // Step 5: Transfer YT to user
        let yt_token_addr: Address = env.storage().instance().get(&DataKey::YtToken).unwrap();
        let yt_client = YtTokenClient::new(&env, &yt_token_addr);
        yt_client.transfer(&intent_engine_addr, &user, &yt_amount);

        // Step 6: Transfer underlying_from_pt back to user
        underlying_client.transfer(&intent_engine_addr, &user, &underlying_from_pt);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "yield_speculation_executed"), user),
            (usdc_amount, yt_amount, underlying_from_pt),
        );

        Ok(yt_amount)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};
    
    use sy_wrapper::{SyWrapper, SyWrapperClient as RealSyWrapperClient};
    use pt_token::{PtToken, PtTokenClient as RealPtClient};
    use yt_token::{YtToken, YtTokenClient as RealYtClient};
    use vault::{Vault, VaultClient as RealVaultClient};
    use tokenizer::{Tokenizer, TokenizerClient as RealTokenizerClient};
    use marketplace::{NovaireMarketplace, NovaireMarketplaceClient as RealMarketplaceClient};

    fn setup_env() -> (Env, Address, Address, IntentEngineClient<'static>, RealMarketplaceClient<'static>, RealPtClient<'static>, RealYtClient<'static>, token::StellarAssetClient<'static>, token::Client<'static>) {
        let env = Env::default();
        env.mock_all_auths_allowing_non_root_auth();

        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);
        let underlying_token = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let token_admin_client = token::StellarAssetClient::new(&env, &underlying_token);
        let underlying_client = token::Client::new(&env, &underlying_token);

        let sy_contract_id = env.register(SyWrapper, ());
        let sy_client = RealSyWrapperClient::new(&env, &sy_contract_id);
        sy_client.initialize(&admin, &underlying_token, &Address::generate(&env));

        let pt_contract_id = env.register(PtToken, ());
        let pt_client = RealPtClient::new(&env, &pt_contract_id);
        pt_client.initialize(&admin);

        let yt_contract_id = env.register(YtToken, ());
        let yt_client = RealYtClient::new(&env, &yt_contract_id);
        yt_client.initialize(&admin);

        let vault_contract_id = env.register(Vault, ());
        let vault_client = RealVaultClient::new(&env, &vault_contract_id);
        vault_client.initialize(&admin, &sy_contract_id, &underlying_token);

        let maturity_ledger = 1_000;
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 0,
            ..env.ledger().get()
        });

        let tokenizer_contract_id = env.register(Tokenizer, ());
        let tokenizer_client = RealTokenizerClient::new(&env, &tokenizer_contract_id);
        tokenizer_client.initialize(&admin, &vault_contract_id, &pt_contract_id, &yt_contract_id, &sy_contract_id, &maturity_ledger);

        let market_contract_id = env.register(NovaireMarketplace, ());
        let market_client = RealMarketplaceClient::new(&env, &market_contract_id);
        market_client.initialize(&admin, &pt_contract_id, &yt_contract_id, &underlying_token, &sy_contract_id, &tokenizer_contract_id, &maturity_ledger);

        // Seed liquidity
        let lp_provider = Address::generate(&env);
        token_admin_client.mint(&lp_provider, &3_000_000); // 3M USDC
        vault_client.deposit(&lp_provider, &2_000_000);
        let sy_bal = vault_client.balance_of(&lp_provider);
        tokenizer_client.mint_pt_yt(&lp_provider, &sy_bal);
        market_client.add_liquidity(&lp_provider, &1_000_000, &1_000_000); // 1M PT, 1M U

        let intent_engine_contract_id = env.register(IntentEngine, ());
        let intent_engine_client = IntentEngineClient::new(&env, &intent_engine_contract_id);
        
        intent_engine_client.initialize(
            &admin,
            &vault_contract_id,
            &tokenizer_contract_id,
            &market_contract_id,
            &sy_contract_id,
            &underlying_token,
            &pt_contract_id,
            &yt_contract_id,
        );

        (env, admin, underlying_token, intent_engine_client, market_client, pt_client, yt_client, token_admin_client, underlying_client)
    }

    #[test]
    fn test_1_fixed_yield_intent() {
        let (env, _, _, intent_engine, _, pt_client, _, token_admin, underlying) = setup_env();
        let user = Address::generate(&env);
        token_admin.mint(&user, &10_000);

        let current_twap = intent_engine.get_current_best_rate();
        
        let record = intent_engine.execute_fixed_yield_intent(&user, &10_000, &current_twap, &1000);
        
        assert_eq!(record.deposited_amount, 10_000);
        assert_eq!(pt_client.balance(&user), record.pt_held); // Received PT
        assert!(underlying.balance(&user) > 0); // Received U back from sold YT
        assert_eq!(underlying.balance(&intent_engine.address), 0); // Contract holds nothing
        assert_eq!(pt_client.balance(&intent_engine.address), 0);
    }

    #[test]
    fn test_2_yield_speculation() {
        let (env, _, _, intent_engine, _, pt_client, yt_client, token_admin, underlying) = setup_env();
        let user = Address::generate(&env);
        token_admin.mint(&user, &10_000);

        let yt_received = intent_engine.execute_yield_speculation_intent(&user, &10_000, &1);
        
        assert!(yt_received > 0);
        assert_eq!(yt_client.balance(&user), yt_received);
        assert!(underlying.balance(&user) > 0); // Received U back from sold PT
        assert_eq!(underlying.balance(&intent_engine.address), 0); // Contract holds nothing
        assert_eq!(pt_client.balance(&intent_engine.address), 0);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #4)")]
    fn test_3_rate_slippage() {
        let (env, _, _, intent_engine, _, _, _, token_admin, _) = setup_env();
        let user = Address::generate(&env);
        token_admin.mint(&user, &10_000);

        let imp_rate = 2_000_000_000; // Impossible rate
        intent_engine.execute_fixed_yield_intent(&user, &10_000, &imp_rate, &1000);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]
    fn test_4_paused() {
        let (env, admin, _, intent_engine, _, _, _, token_admin, _) = setup_env();
        let user = Address::generate(&env);
        token_admin.mint(&user, &10_000);

        intent_engine.pause();

        intent_engine.execute_fixed_yield_intent(&user, &10_000, &1, &1000);
    }
}
