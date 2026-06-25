#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, token, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireSyError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    RateCannotDecrease = 5,
    InsufficientShares = 6,
}

const EXCHANGE_RATE_SCALAR: i128 = 1_000_000_000;

#[contract]
pub struct SyWrapper;

#[contractimpl]
impl SyWrapper {
    pub fn initialize(
        env: Env,
        admin: Address,
        underlying: Address,
        yield_source: Address,
    ) -> Result<(), NovaireSyError> {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            return Err(NovaireSyError::AlreadyInitialized);
        }

        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "underlying"), &underlying);
        env.storage().instance().set(&Symbol::new(&env, "yield_source"), &yield_source);
        env.storage().instance().set(&Symbol::new(&env, "total_shares"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "exchange_rate"), &EXCHANGE_RATE_SCALAR);
        env.storage().instance().set(&Symbol::new(&env, "last_updated"), &env.ledger().sequence());

        Ok(())
    }

    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<i128, NovaireSyError> {
        from.require_auth();

        if amount <= 0 {
            return Err(NovaireSyError::InvalidAmount);
        }

        let underlying_addr: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "underlying"))
            .ok_or(NovaireSyError::NotInitialized)?;

        let rate: i128 = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "exchange_rate"))
            .ok_or(NovaireSyError::NotInitialized)?;

        let mut total_shares: i128 = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "total_shares"))
            .unwrap_or(0);

        // Calculate shares to mint
        let shares_to_mint = amount.checked_mul(EXCHANGE_RATE_SCALAR).unwrap() / rate;

        // Pull underlying token from user to this contract
        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        // Update total_shares in storage
        total_shares += shares_to_mint;
        env.storage().instance().set(&Symbol::new(&env, "total_shares"), &total_shares);

        env.events()
            .publish((Symbol::new(&env, "sy_deposit"), from), (amount, shares_to_mint));

        Ok(shares_to_mint)
    }

    pub fn withdraw(env: Env, from: Address, shares: i128) -> Result<i128, NovaireSyError> {
        from.require_auth();

        if shares <= 0 {
            return Err(NovaireSyError::InvalidAmount);
        }

        let underlying_addr: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "underlying"))
            .ok_or(NovaireSyError::NotInitialized)?;

        let rate: i128 = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "exchange_rate"))
            .ok_or(NovaireSyError::NotInitialized)?;

        let mut total_shares: i128 = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "total_shares"))
            .unwrap_or(0);

        if shares > total_shares {
            return Err(NovaireSyError::InsufficientShares);
        }

        // Calculate underlying to return
        let underlying_to_return = shares.checked_mul(rate).unwrap() / EXCHANGE_RATE_SCALAR;

        // Update total_shares in storage
        total_shares -= shares;
        env.storage().instance().set(&Symbol::new(&env, "total_shares"), &total_shares);

        // Push underlying token from this contract back to user
        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&env.current_contract_address(), &from, &underlying_to_return);

        env.events()
            .publish((Symbol::new(&env, "sy_withdraw"), from), (shares, underlying_to_return));

        Ok(underlying_to_return)
    }

    pub fn accrue_yield(env: Env, new_exchange_rate: i128) -> Result<(), NovaireSyError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "admin"))
            .ok_or(NovaireSyError::NotInitialized)?;
            
        admin.require_auth();

        let current_rate: i128 = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "exchange_rate"))
            .unwrap();

        if new_exchange_rate < current_rate {
            return Err(NovaireSyError::RateCannotDecrease);
        }

        env.storage().instance().set(&Symbol::new(&env, "exchange_rate"), &new_exchange_rate);
        env.storage().instance().set(&Symbol::new(&env, "last_updated"), &env.ledger().sequence());

        env.events()
            .publish((Symbol::new(&env, "yield_accrued"),), (current_rate, new_exchange_rate));

        Ok(())
    }

    pub fn get_exchange_rate(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&Symbol::new(&env, "exchange_rate"))
            .unwrap_or(EXCHANGE_RATE_SCALAR)
    }

    pub fn preview_deposit(env: Env, amount: i128) -> i128 {
        let rate: i128 = env.storage().instance().get(&Symbol::new(&env, "exchange_rate")).unwrap_or(EXCHANGE_RATE_SCALAR);
        amount.checked_mul(EXCHANGE_RATE_SCALAR).unwrap() / rate
    }

    pub fn preview_withdraw(env: Env, shares: i128) -> i128 {
        let rate: i128 = env.storage().instance().get(&Symbol::new(&env, "exchange_rate")).unwrap_or(EXCHANGE_RATE_SCALAR);
        shares.checked_mul(rate).unwrap() / EXCHANGE_RATE_SCALAR
    }

    pub fn total_shares(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&Symbol::new(&env, "total_shares"))
            .unwrap_or(0)
    }

    pub fn underlying_asset(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&Symbol::new(&env, "underlying"))
            .unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, token, Address, Env};

    #[test]
    fn test_sy_wrapper_flow() {
        let env = Env::default();
        env.mock_all_auths();

        // 1. Initialize addresses
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let yield_source = Address::generate(&env);
        
        // Setup mock token
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let token_client = token::Client::new(&env, &token_contract);
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);
        
        // Mint initial tokens to user
        let initial_deposit: i128 = 1000;
        token_admin_client.mint(&user, &initial_deposit);

        // Deploy and initialize sy_wrapper
        let contract_id = env.register(SyWrapper, ());
        let client = SyWrapperClient::new(&env, &contract_id);

        client.initialize(&admin, &token_contract, &yield_source);

        // 2. Deposit 1000 USDC
        let shares_minted = client.deposit(&user, &initial_deposit);
        assert_eq!(shares_minted, 1000); // 1000 * 1e9 / 1e9 = 1000
        assert_eq!(client.total_shares(), 1000);
        assert_eq!(token_client.balance(&user), 0);
        assert_eq!(token_client.balance(&contract_id), 1000);

        // 3. Accrue Yield (10% yield -> rate becomes 1.1e9)
        let new_rate: i128 = 1_100_000_000;
        client.accrue_yield(&new_rate);
        assert_eq!(client.get_exchange_rate(), new_rate);

        // Simulate external yield being added to the contract balance
        let yield_amount: i128 = 100;
        token_admin_client.mint(&contract_id, &yield_amount);
        assert_eq!(token_client.balance(&contract_id), 1100);

        // 4. Withdraw all shares
        let withdrawn_amount = client.withdraw(&user, &shares_minted);
        assert_eq!(withdrawn_amount, 1100); // 1000 shares * 1.1e9 / 1e9 = 1100
        
        // 5. Verify state
        assert_eq!(client.total_shares(), 0);
        assert_eq!(token_client.balance(&user), 1100);
        assert_eq!(token_client.balance(&contract_id), 0);
    }
}
