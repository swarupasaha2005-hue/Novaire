#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, token, Address, Env, Symbol};
#[soroban_sdk::contractclient(name = "SyWrapperClient")]
pub trait SyWrapperInterface {
    fn deposit(env: Env, from: Address, amount: i128) -> i128;
    fn withdraw(env: Env, from: Address, shares: i128) -> i128;
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireVaultError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    Paused = 4,
    InvalidAmount = 5,
    InsufficientShares = 6,
    ExternalCallFailed = 7,
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn initialize(
        env: Env,
        admin: Address,
        sy_wrapper: Address,
        underlying: Address,
    ) -> Result<(), NovaireVaultError> {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            return Err(NovaireVaultError::AlreadyInitialized);
        }

        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "sy_wrapper"), &sy_wrapper);
        env.storage().instance().set(&Symbol::new(&env, "underlying"), &underlying);
        env.storage().instance().set(&Symbol::new(&env, "total_deposits"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);

        Ok(())
    }

    pub fn deposit(env: Env, depositor: Address, amount: i128) -> Result<i128, NovaireVaultError> {
        depositor.require_auth();

        let paused: bool = env.storage().instance().get(&Symbol::new(&env, "paused")).unwrap_or(false);
        if paused {
            return Err(NovaireVaultError::Paused);
        }

        if amount <= 0 {
            return Err(NovaireVaultError::InvalidAmount);
        }

        let underlying_addr: Address = env.storage().instance().get(&Symbol::new(&env, "underlying")).ok_or(NovaireVaultError::NotInitialized)?;
        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).ok_or(NovaireVaultError::NotInitialized)?;
        let mut total_deposits: i128 = env.storage().instance().get(&Symbol::new(&env, "total_deposits")).unwrap_or(0);

        // 1. Pull underlying from depositor to Vault
        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&depositor, &env.current_contract_address(), &amount);

        // 2. Vault deposits underlying into SY Wrapper
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let sy_shares = sy_client.deposit(&env.current_contract_address(), &amount);

        // 3. Update user's vault share balance
        let user_shares_key = (Symbol::new(&env, "us"), depositor.clone());
        let mut current_user_shares: i128 = env.storage().persistent().get(&user_shares_key).unwrap_or(0);
        current_user_shares += sy_shares;
        env.storage().persistent().set(&user_shares_key, &current_user_shares);

        // 4. Update total_deposits (track amount of underlying deposited in)
        total_deposits += amount;
        env.storage().instance().set(&Symbol::new(&env, "total_deposits"), &total_deposits);

        env.events().publish((Symbol::new(&env, "vault_deposit"), depositor), (amount, sy_shares));

        Ok(sy_shares)
    }

    pub fn withdraw(env: Env, withdrawer: Address, shares: i128) -> Result<i128, NovaireVaultError> {
        withdrawer.require_auth();

        let paused: bool = env.storage().instance().get(&Symbol::new(&env, "paused")).unwrap_or(false);
        if paused {
            return Err(NovaireVaultError::Paused);
        }

        if shares <= 0 {
            return Err(NovaireVaultError::InvalidAmount);
        }

        let underlying_addr: Address = env.storage().instance().get(&Symbol::new(&env, "underlying")).ok_or(NovaireVaultError::NotInitialized)?;
        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).ok_or(NovaireVaultError::NotInitialized)?;
        let mut total_deposits: i128 = env.storage().instance().get(&Symbol::new(&env, "total_deposits")).unwrap_or(0);

        let user_shares_key = (Symbol::new(&env, "us"), withdrawer.clone());
        let mut current_user_shares: i128 = env.storage().persistent().get(&user_shares_key).unwrap_or(0);

        if current_user_shares < shares {
            return Err(NovaireVaultError::InsufficientShares);
        }

        // Deduct shares FIRST to prevent reentrancy / underflow
        current_user_shares -= shares;
        env.storage().persistent().set(&user_shares_key, &current_user_shares);

        // Withdraw from SY Wrapper
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let underlying_amount = sy_client.withdraw(&env.current_contract_address(), &shares);

        // Transfer underlying back to withdrawer
        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&env.current_contract_address(), &withdrawer, &underlying_amount);

        // Update total_deposits
        if total_deposits < underlying_amount {
            total_deposits = 0;
        } else {
            total_deposits -= underlying_amount;
        }
        env.storage().instance().set(&Symbol::new(&env, "total_deposits"), &total_deposits);

        env.events().publish((Symbol::new(&env, "vault_withdraw"), withdrawer), (shares, underlying_amount));

        Ok(underlying_amount)
    }

    pub fn transfer_shares(env: Env, from: Address, to: Address, amount: i128) -> Result<(), NovaireVaultError> {
        from.require_auth();
        let paused: bool = env.storage().instance().get(&Symbol::new(&env, "paused")).unwrap_or(false);
        if paused {
            return Err(NovaireVaultError::Paused);
        }
        if amount <= 0 {
            return Err(NovaireVaultError::InvalidAmount);
        }
        
        let from_key = (Symbol::new(&env, "us"), from.clone());
        let to_key = (Symbol::new(&env, "us"), to.clone());
        
        let mut from_shares: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_shares < amount {
            return Err(NovaireVaultError::InsufficientShares);
        }
        from_shares -= amount;
        env.storage().persistent().set(&from_key, &from_shares);
        
        let mut to_shares: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        to_shares += amount;
        env.storage().persistent().set(&to_key, &to_shares);
        
        Ok(())
    }

    pub fn withdraw_for(env: Env, withdrawer: Address, receiver: Address, shares: i128) -> Result<i128, NovaireVaultError> {
        withdrawer.require_auth();

        let paused: bool = env.storage().instance().get(&Symbol::new(&env, "paused")).unwrap_or(false);
        if paused {
            return Err(NovaireVaultError::Paused);
        }

        if shares <= 0 {
            return Err(NovaireVaultError::InvalidAmount);
        }

        let underlying_addr: Address = env.storage().instance().get(&Symbol::new(&env, "underlying")).ok_or(NovaireVaultError::NotInitialized)?;
        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).ok_or(NovaireVaultError::NotInitialized)?;
        let mut total_deposits: i128 = env.storage().instance().get(&Symbol::new(&env, "total_deposits")).unwrap_or(0);

        let user_shares_key = (Symbol::new(&env, "us"), withdrawer.clone());
        let mut current_user_shares: i128 = env.storage().persistent().get(&user_shares_key).unwrap_or(0);

        if current_user_shares < shares {
            return Err(NovaireVaultError::InsufficientShares);
        }

        current_user_shares -= shares;
        env.storage().persistent().set(&user_shares_key, &current_user_shares);

        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let underlying_amount = sy_client.withdraw(&env.current_contract_address(), &shares);

        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&env.current_contract_address(), &receiver, &underlying_amount);

        if total_deposits < underlying_amount {
            total_deposits = 0;
        } else {
            total_deposits -= underlying_amount;
        }
        env.storage().instance().set(&Symbol::new(&env, "total_deposits"), &total_deposits);

        env.events().publish((Symbol::new(&env, "vault_withdraw"), withdrawer), (shares, underlying_amount));

        Ok(underlying_amount)
    }

    pub fn balance_of(env: Env, user: Address) -> i128 {
        let user_shares_key = (Symbol::new(&env, "us"), user);
        env.storage().persistent().get(&user_shares_key).unwrap_or(0)
    }

    pub fn total_value_locked(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "total_deposits")).unwrap_or(0)
    }

    pub fn pause(env: Env) -> Result<(), NovaireVaultError> {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).ok_or(NovaireVaultError::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "paused"), &true);
        env.events().publish((Symbol::new(&env, "vault_paused"),), ());
        Ok(())
    }

    pub fn unpause(env: Env) -> Result<(), NovaireVaultError> {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).ok_or(NovaireVaultError::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "paused"), &false);
        env.events().publish((Symbol::new(&env, "vault_unpaused"),), ());
        Ok(())
    }

    pub fn get_sy_wrapper(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, token, Address, Env};
    use sy_wrapper::{SyWrapper, SyWrapperClient as OriginalSyWrapperClient};

    #[test]
    fn test_vault_flow() {
        let env = Env::default();
        env.mock_all_auths_allowing_non_root_auth();

        // 1. Setup Addresses
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);
        let yield_source = Address::generate(&env);

        // 2. Setup Mock Token
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let token_client = token::Client::new(&env, &token_contract);
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);

        // Mint initial balances
        token_admin_client.mint(&alice, &500);
        token_admin_client.mint(&bob, &500);

        // 3. Deploy and Initialize SY Wrapper
        let sy_contract_id = env.register(SyWrapper, ());
        let sy_client = OriginalSyWrapperClient::new(&env, &sy_contract_id);
        sy_client.initialize(&admin, &token_contract, &yield_source);

        // 4. Deploy and Initialize Vault
        let vault_contract_id = env.register(Vault, ());
        let vault_client = VaultClient::new(&env, &vault_contract_id);
        vault_client.initialize(&admin, &sy_contract_id, &token_contract);

        // 5. Alice deposits 500 USDC
        let alice_shares = vault_client.deposit(&alice, &500);
        assert_eq!(alice_shares, 500);
        assert_eq!(vault_client.balance_of(&alice), 500);
        assert_eq!(vault_client.total_value_locked(), 500);
        
        // 6. Bob deposits 500 USDC
        let bob_shares = vault_client.deposit(&bob, &500);
        assert_eq!(bob_shares, 500);
        assert_eq!(vault_client.balance_of(&bob), 500);
        assert_eq!(vault_client.total_value_locked(), 1000);
        
        // 7. Accrue 10% Yield on SY Wrapper
        let new_rate: i128 = 1_100_000_000;
        sy_client.accrue_yield(&new_rate);
        
        // Physically add yield to SY wrapper so it can satisfy withdrawals
        token_admin_client.mint(&sy_contract_id, &100);

        // 8. Bob withdraws all shares -> receives 550 underlying (500 * 1.1)
        let bob_returned = vault_client.withdraw(&bob, &bob_shares);
        assert_eq!(bob_returned, 550);
        assert_eq!(vault_client.balance_of(&bob), 0);
        assert_eq!(token_client.balance(&bob), 550);
        
        // 9. Test pause functionality
        vault_client.pause();
        
        // Next deposit should fail because of pause
        let deposit_res = vault_client.try_deposit(&alice, &10);
        assert!(deposit_res.is_err() || deposit_res.unwrap().is_err());
        
        // Unpause and verify it works again
        vault_client.unpause();
        token_admin_client.mint(&alice, &10);
        let alice_shares_2 = vault_client.deposit(&alice, &10);
        assert_eq!(alice_shares_2, 9); // 10 * 1e9 / 1.1e9 = 9 shares
    }
}
