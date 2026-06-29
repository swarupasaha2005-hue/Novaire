#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol};

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
    MathOverflow = 7,
    MathUnderflow = 8,
    StorageMissing = 9,
    Paused = 10,
    InvalidAdminTransfer = 11,
    RateIncreaseTooLarge = 12,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    PendingAdmin,
    Underlying,
    YieldSource,
    TotalShares,
    ExchangeRate,
    LastUpdated,
    Paused,
    MaxRateStep,
}

const EXCHANGE_RATE_SCALAR: i128 = 1_000_000_000;
const VERSION: u32 = 1;

mod storage {
    use super::*;
    
    pub fn is_initialized(env: &Env) -> bool {
        env.storage().instance().has(&DataKey::Admin)
    }

    pub fn get_admin(env: &Env) -> Result<Address, NovaireSyError> {
        env.storage().instance().get(&DataKey::Admin).ok_or(NovaireSyError::StorageMissing)
    }

    pub fn get_underlying(env: &Env) -> Result<Address, NovaireSyError> {
        env.storage().instance().get(&DataKey::Underlying).ok_or(NovaireSyError::StorageMissing)
    }

    pub fn get_exchange_rate(env: &Env) -> Result<i128, NovaireSyError> {
        env.storage().instance().get(&DataKey::ExchangeRate).ok_or(NovaireSyError::StorageMissing)
    }
    
    pub fn get_total_shares(env: &Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalShares).unwrap_or(0)
    }

    pub fn is_paused(env: &Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }
    
    pub fn require_not_paused(env: &Env) -> Result<(), NovaireSyError> {
        if is_paused(env) {
            return Err(NovaireSyError::Paused);
        }
        Ok(())
    }
}

#[contract]
pub struct SyWrapper;

#[contractimpl]
impl SyWrapper {
    pub fn version() -> u32 {
        VERSION
    }

    pub fn initialize(
        env: Env,
        admin: Address,
        underlying: Address,
        yield_source: Address,
        max_rate_step: i128,
    ) -> Result<(), NovaireSyError> {
        if storage::is_initialized(&env) {
            return Err(NovaireSyError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Underlying, &underlying);
        env.storage().instance().set(&DataKey::YieldSource, &yield_source);
        env.storage().instance().set(&DataKey::TotalShares, &0i128);
        env.storage().instance().set(&DataKey::ExchangeRate, &EXCHANGE_RATE_SCALAR);
        env.storage().instance().set(&DataKey::LastUpdated, &env.ledger().sequence());
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage().instance().set(&DataKey::MaxRateStep, &max_rate_step);

        Ok(())
    }

    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<i128, NovaireSyError> {
        from.require_auth();
        storage::require_not_paused(&env)?;

        if amount <= 0 {
            return Err(NovaireSyError::InvalidAmount);
        }

        let underlying_addr = storage::get_underlying(&env)?;
        let rate = storage::get_exchange_rate(&env)?;
        let mut total_shares = storage::get_total_shares(&env);

        let shares_to_mint = amount
            .checked_mul(EXCHANGE_RATE_SCALAR)
            .ok_or(NovaireSyError::MathOverflow)?
            .checked_div(rate)
            .ok_or(NovaireSyError::MathUnderflow)?;

        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        total_shares = total_shares.checked_add(shares_to_mint).ok_or(NovaireSyError::MathOverflow)?;
        env.storage().instance().set(&DataKey::TotalShares, &total_shares);

        env.events().publish(
            (Symbol::new(&env, "sy_deposit"), from), 
            (amount, shares_to_mint, total_shares, rate)
        );

        Ok(shares_to_mint)
    }

    pub fn withdraw(env: Env, from: Address, shares: i128) -> Result<i128, NovaireSyError> {
        from.require_auth();
        storage::require_not_paused(&env)?;

        if shares <= 0 {
            return Err(NovaireSyError::InvalidAmount);
        }

        let underlying_addr = storage::get_underlying(&env)?;
        let rate = storage::get_exchange_rate(&env)?;
        let mut total_shares = storage::get_total_shares(&env);

        if shares > total_shares {
            return Err(NovaireSyError::InsufficientShares);
        }

        let underlying_to_return = shares
            .checked_mul(rate)
            .ok_or(NovaireSyError::MathOverflow)?
            .checked_div(EXCHANGE_RATE_SCALAR)
            .ok_or(NovaireSyError::MathUnderflow)?;

        total_shares = total_shares.checked_sub(shares).ok_or(NovaireSyError::MathUnderflow)?;
        env.storage().instance().set(&DataKey::TotalShares, &total_shares);

        let token_client = token::Client::new(&env, &underlying_addr);
        token_client.transfer(&env.current_contract_address(), &from, &underlying_to_return);

        env.events().publish(
            (Symbol::new(&env, "sy_withdraw"), from), 
            (shares, underlying_to_return, total_shares, rate)
        );

        Ok(underlying_to_return)
    }

    pub fn accrue_yield(env: Env, new_exchange_rate: i128) -> Result<(), NovaireSyError> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        storage::require_not_paused(&env)?;

        let current_rate = storage::get_exchange_rate(&env)?;

        if new_exchange_rate < current_rate {
            return Err(NovaireSyError::RateCannotDecrease);
        }

        let max_rate_step: i128 = env.storage().instance().get(&DataKey::MaxRateStep).ok_or(NovaireSyError::StorageMissing)?;
        let diff = new_exchange_rate.checked_sub(current_rate).ok_or(NovaireSyError::MathUnderflow)?;
        
        if diff > max_rate_step {
            return Err(NovaireSyError::RateIncreaseTooLarge);
        }

        env.storage().instance().set(&DataKey::ExchangeRate, &new_exchange_rate);
        env.storage().instance().set(&DataKey::LastUpdated, &env.ledger().sequence());

        let total_shares = storage::get_total_shares(&env);
        env.events().publish(
            (Symbol::new(&env, "yield_accrued"),), 
            (current_rate, new_exchange_rate, total_shares, env.ledger().sequence())
        );

        Ok(())
    }

    pub fn pause(env: Env) -> Result<(), NovaireSyError> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &true);
        Ok(())
    }

    pub fn unpause(env: Env) -> Result<(), NovaireSyError> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    pub fn transfer_admin(env: Env, new_admin: Address) -> Result<(), NovaireSyError> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::PendingAdmin, &new_admin);
        Ok(())
    }

    pub fn accept_admin(env: Env) -> Result<(), NovaireSyError> {
        let pending_admin: Address = env.storage().instance().get(&DataKey::PendingAdmin).ok_or(NovaireSyError::InvalidAdminTransfer)?;
        pending_admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &pending_admin);
        env.storage().instance().remove(&DataKey::PendingAdmin);
        Ok(())
    }

    pub fn set_max_rate_step(env: Env, step: i128) -> Result<(), NovaireSyError> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::MaxRateStep, &step);
        Ok(())
    }

    pub fn get_exchange_rate(env: Env) -> i128 {
        storage::get_exchange_rate(&env).unwrap_or(EXCHANGE_RATE_SCALAR)
    }

    pub fn preview_deposit(env: Env, amount: i128) -> i128 {
        let rate = storage::get_exchange_rate(&env).unwrap_or(EXCHANGE_RATE_SCALAR);
        amount.checked_mul(EXCHANGE_RATE_SCALAR).unwrap_or(0).checked_div(rate).unwrap_or(0)
    }

    pub fn preview_withdraw(env: Env, shares: i128) -> i128 {
        let rate = storage::get_exchange_rate(&env).unwrap_or(EXCHANGE_RATE_SCALAR);
        shares.checked_mul(rate).unwrap_or(0).checked_div(EXCHANGE_RATE_SCALAR).unwrap_or(0)
    }

    pub fn total_shares(env: Env) -> i128 {
        storage::get_total_shares(&env)
    }

    pub fn underlying_asset(env: Env) -> Address {
        storage::get_underlying(&env).unwrap()
    }
}

#[cfg(test)]
mod test;
#[cfg(test)]
mod audit_tests;
