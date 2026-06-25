#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireTokenizerError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    EpochExpired = 4,
    EpochNotExpired = 5,
    AlreadySettled = 6,
    InsufficientBalance = 7,
    InvariantViolated = 8,
    ZeroAmount = 9,
}

#[soroban_sdk::contractclient(name = "VaultClient")]
pub trait VaultInterface {
    fn transfer_shares(env: Env, from: Address, to: Address, amount: i128);
    fn withdraw_for(env: Env, withdrawer: Address, receiver: Address, shares: i128) -> i128;
    fn balance_of(env: Env, user: Address) -> i128;
}

#[soroban_sdk::contractclient(name = "SyWrapperClient")]
pub trait SyWrapperInterface {
    fn get_exchange_rate(env: Env) -> i128;
}

#[soroban_sdk::contractclient(name = "PtTokenClient")]
pub trait PtTokenInterface {
    fn mint(env: Env, to: Address, amount: i128);
    fn burn(env: Env, from: Address, amount: i128);
    fn balance(env: Env, id: Address) -> i128;
    fn total_supply(env: Env) -> i128;
}

#[soroban_sdk::contractclient(name = "YtTokenClient")]
pub trait YtTokenInterface {
    fn mint(env: Env, to: Address, amount: i128);
    fn checkpoint_user(env: Env, user: Address);
    fn claimable_yield(env: Env, user: Address) -> i128;
    fn reset_claimable(env: Env, user: Address);
    fn update_yield_index(env: Env, new_index: i128);
}

#[contract]
pub struct Tokenizer;

#[contractimpl]
impl Tokenizer {
    pub fn initialize(
        env: Env,
        admin: Address,
        vault: Address,
        pt_token: Address,
        yt_token: Address,
        sy_wrapper: Address,
        maturity_ledger: u32,
    ) -> Result<(), NovaireTokenizerError> {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            return Err(NovaireTokenizerError::AlreadyInitialized);
        }
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper);
        let epoch_start_index = sy_client.get_exchange_rate();

        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "vault"), &vault);
        env.storage().instance().set(&Symbol::new(&env, "pt_token"), &pt_token);
        env.storage().instance().set(&Symbol::new(&env, "yt_token"), &yt_token);
        env.storage().instance().set(&Symbol::new(&env, "sy_wrapper"), &sy_wrapper);
        env.storage().instance().set(&Symbol::new(&env, "maturity_ledger"), &maturity_ledger);
        env.storage().instance().set(&Symbol::new(&env, "epoch_id"), &1u32);
        env.storage().instance().set(&Symbol::new(&env, "epoch_start_index"), &epoch_start_index);
        env.storage().instance().set(&Symbol::new(&env, "total_pt_minted"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "settled"), &false);
        Ok(())
    }

    pub fn mint_pt_yt(env: Env, user: Address, sy_shares: i128) -> Result<(i128, i128), NovaireTokenizerError> {
        user.require_auth();
        if sy_shares <= 0 {
            return Err(NovaireTokenizerError::ZeroAmount);
        }

        let maturity_ledger: u32 = env.storage().instance().get(&Symbol::new(&env, "maturity_ledger")).ok_or(NovaireTokenizerError::NotInitialized)?;
        if env.ledger().sequence() >= maturity_ledger {
            return Err(NovaireTokenizerError::EpochExpired);
        }

        let vault_addr: Address = env.storage().instance().get(&Symbol::new(&env, "vault")).unwrap();
        let pt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "pt_token")).unwrap();
        let yt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "yt_token")).unwrap();
        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap();

        let vault_client = VaultClient::new(&env, &vault_addr);
        vault_client.transfer_shares(&user, &env.current_contract_address(), &sy_shares);

        let pt_client = PtTokenClient::new(&env, &pt_token_addr);
        pt_client.mint(&user, &sy_shares);

        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let exchange_rate = sy_client.get_exchange_rate();

        let yt_client = YtTokenClient::new(&env, &yt_token_addr);
        yt_client.update_yield_index(&exchange_rate);
        yt_client.mint(&user, &sy_shares);

        let mut total_pt_minted: i128 = env.storage().instance().get(&Symbol::new(&env, "total_pt_minted")).unwrap();
        total_pt_minted += sy_shares;
        env.storage().instance().set(&Symbol::new(&env, "total_pt_minted"), &total_pt_minted);

        env.events().publish((Symbol::new(&env, "mint_pt_yt"), user), sy_shares);

        Self::assert_invariant(env.clone())?;

        Ok((sy_shares, sy_shares))
    }

    pub fn redeem_pt(env: Env, user: Address, pt_amount: i128) -> Result<i128, NovaireTokenizerError> {
        user.require_auth();
        let maturity_ledger: u32 = env.storage().instance().get(&Symbol::new(&env, "maturity_ledger")).ok_or(NovaireTokenizerError::NotInitialized)?;
        if env.ledger().sequence() < maturity_ledger {
            return Err(NovaireTokenizerError::EpochNotExpired);
        }

        let pt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "pt_token")).unwrap();
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);
        
        let user_pt_balance = pt_client.balance(&user);
        if user_pt_balance < pt_amount {
            return Err(NovaireTokenizerError::InsufficientBalance);
        }

        pt_client.burn(&user, &pt_amount);

        let epoch_start_index: i128 = env.storage().instance().get(&Symbol::new(&env, "epoch_start_index")).unwrap();
        
        // PT guarantees the initial principal value.
        // 1 PT is backed by `epoch_start_index` underlying.
        let underlying = (pt_amount.checked_mul(epoch_start_index).unwrap()) / 1_000_000_000;

        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap();
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let final_exchange_rate = sy_client.get_exchange_rate();

        let shares_to_withdraw = (underlying.checked_mul(1_000_000_000).unwrap()) / final_exchange_rate;

        let vault_addr: Address = env.storage().instance().get(&Symbol::new(&env, "vault")).unwrap();
        let vault_client = VaultClient::new(&env, &vault_addr);
        
        vault_client.withdraw_for(&env.current_contract_address(), &user, &shares_to_withdraw);

        env.events().publish((Symbol::new(&env, "redeem_pt"), user), (pt_amount, underlying));

        Ok(underlying)
    }

    pub fn claim_yield(env: Env, user: Address) -> Result<i128, NovaireTokenizerError> {
        user.require_auth();
        let maturity_ledger: u32 = env.storage().instance().get(&Symbol::new(&env, "maturity_ledger")).ok_or(NovaireTokenizerError::NotInitialized)?;
        if env.ledger().sequence() >= maturity_ledger {
            return Err(NovaireTokenizerError::EpochExpired);
        }

        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap();
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let exchange_rate = sy_client.get_exchange_rate();

        let yt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "yt_token")).unwrap();
        let yt_client = YtTokenClient::new(&env, &yt_token_addr);
        
        yt_client.update_yield_index(&exchange_rate);
        yt_client.checkpoint_user(&user);
        let claimable = yt_client.claimable_yield(&user);
        if claimable <= 0 {
            return Err(NovaireTokenizerError::ZeroAmount);
        }

        yt_client.reset_claimable(&user);

        let shares_to_withdraw = (claimable.checked_mul(1_000_000_000).unwrap()) / exchange_rate;

        let vault_addr: Address = env.storage().instance().get(&Symbol::new(&env, "vault")).unwrap();
        let vault_client = VaultClient::new(&env, &vault_addr);
        
        vault_client.withdraw_for(&env.current_contract_address(), &user, &shares_to_withdraw);

        env.events().publish((Symbol::new(&env, "yield_claimed"), user), claimable);

        Ok(claimable)
    }

    pub fn settle_epoch(env: Env) -> Result<(), NovaireTokenizerError> {
        let maturity_ledger: u32 = env.storage().instance().get(&Symbol::new(&env, "maturity_ledger")).ok_or(NovaireTokenizerError::NotInitialized)?;
        if env.ledger().sequence() < maturity_ledger {
            return Err(NovaireTokenizerError::EpochNotExpired);
        }
        let settled: bool = env.storage().instance().get(&Symbol::new(&env, "settled")).unwrap();
        if settled {
            return Ok(());
        }

        env.storage().instance().set(&Symbol::new(&env, "settled"), &true);

        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap();
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let exchange_rate = sy_client.get_exchange_rate();

        let yt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "yt_token")).unwrap();
        let yt_client = YtTokenClient::new(&env, &yt_token_addr);
        yt_client.update_yield_index(&exchange_rate);

        let epoch_id: u32 = env.storage().instance().get(&Symbol::new(&env, "epoch_id")).unwrap();
        env.events().publish((Symbol::new(&env, "epoch_settled"),), (epoch_id, maturity_ledger));

        Self::assert_invariant(env.clone())?;

        Ok(())
    }

    pub fn get_epoch_info(env: Env) -> Result<(u32, u32, bool), NovaireTokenizerError> {
        let epoch_id: u32 = env.storage().instance().get(&Symbol::new(&env, "epoch_id")).ok_or(NovaireTokenizerError::NotInitialized)?;
        let maturity_ledger: u32 = env.storage().instance().get(&Symbol::new(&env, "maturity_ledger")).unwrap();
        let settled: bool = env.storage().instance().get(&Symbol::new(&env, "settled")).unwrap();
        Ok((epoch_id, maturity_ledger, settled))
    }

    fn assert_invariant(env: Env) -> Result<(), NovaireTokenizerError> {
        let pt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "pt_token")).unwrap();
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);
        let pt_outstanding = pt_client.total_supply();
        
        let vault_addr: Address = env.storage().instance().get(&Symbol::new(&env, "vault")).unwrap();
        let vault_client = VaultClient::new(&env, &vault_addr);
        let sy_shares_held = vault_client.balance_of(&env.current_contract_address());
        
        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap();
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let current_exchange_rate = sy_client.get_exchange_rate();
        let epoch_start_index: i128 = env.storage().instance().get(&Symbol::new(&env, "epoch_start_index")).unwrap();

        let pt_value_in_underlying = (pt_outstanding.checked_mul(epoch_start_index).unwrap()) / 1_000_000_000;
        let total_underlying_held = (sy_shares_held.checked_mul(current_exchange_rate).unwrap()) / 1_000_000_000;

        // The value held by Tokenizer in underlying assets MUST equal the principal (PT value) 
        // PLUS whatever yield has not been claimed yet.
        // Because claim_yield removes exactly its value in underlying from total_underlying_held.
        // And we don't have a direct way to query total unclaimed yield across all users in O(1).
        // But we DO know that `total_underlying_held >= pt_value_in_underlying`.
        if total_underlying_held < pt_value_in_underlying {
            return Err(NovaireTokenizerError::InvariantViolated);
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, testutils::Ledger, token, Address, Env};
    
    use pt_token::{PtToken, PtTokenClient as RealPtClient};
    use yt_token::{YtToken, YtTokenClient as RealYtClient};
    use vault::{Vault, VaultClient as RealVaultClient};
    use sy_wrapper::{SyWrapper, SyWrapperClient as RealSyWrapperClient};

    #[test]
    fn test_tokenizer_flow() {
        let env = Env::default();
        env.mock_all_auths_allowing_non_root_auth();

        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let yield_source = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);
        let token_client = token::Client::new(&env, &token_contract);

        token_admin_client.mint(&user, &1000);

        let sy_contract_id = env.register(SyWrapper, ());
        let sy_client = RealSyWrapperClient::new(&env, &sy_contract_id);
        sy_client.initialize(&admin, &token_contract, &yield_source);

        let vault_contract_id = env.register(Vault, ());
        let vault_client = RealVaultClient::new(&env, &vault_contract_id);
        vault_client.initialize(&admin, &sy_contract_id, &token_contract);

        let pt_contract_id = env.register(PtToken, ());
        let pt_client = RealPtClient::new(&env, &pt_contract_id);

        let yt_contract_id = env.register(YtToken, ());
        let yt_client = RealYtClient::new(&env, &yt_contract_id);

        let tokenizer_contract_id = env.register(Tokenizer, ());
        let tokenizer_client = TokenizerClient::new(&env, &tokenizer_contract_id);

        let maturity_ledger = 100;
        
        pt_client.initialize(&tokenizer_contract_id);
        yt_client.initialize(&tokenizer_contract_id);
        yt_client.set_maturity(&maturity_ledger);

        tokenizer_client.initialize(
            &admin,
            &vault_contract_id,
            &pt_contract_id,
            &yt_contract_id,
            &sy_contract_id,
            &maturity_ledger,
        );

        // Deposit 100 USDC to Vault
        vault_client.deposit(&user, &100);
        let user_vault_shares = vault_client.balance_of(&user);
        assert_eq!(user_vault_shares, 100);

        // 1. Full mint_pt_yt flow
        tokenizer_client.mint_pt_yt(&user, &100);
        assert_eq!(pt_client.balance(&user), 100);
        assert_eq!(yt_client.balance(&user), 100);
        assert_eq!(vault_client.balance_of(&tokenizer_contract_id), 100);

        // 2 & 3. Yield accrual and claim
        sy_client.accrue_yield(&1_500_000_000); // 1.5x
        token_admin_client.mint(&sy_contract_id, &50); // Give the physical yield to SY wrapper

        tokenizer_client.claim_yield(&user);
        
        // 4. Cannot redeem PT before maturity
        let res = tokenizer_client.try_redeem_pt(&user, &100);
        assert!(res.is_err());

        // 5. Settle epoch and redeem PT
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });
        tokenizer_client.settle_epoch();
        
        tokenizer_client.redeem_pt(&user, &100);
        assert_eq!(pt_client.balance(&user), 0);

        // 6. YT worthless after maturity
        let claim_res = tokenizer_client.try_claim_yield(&user);
        assert!(claim_res.is_err());
    }
}
