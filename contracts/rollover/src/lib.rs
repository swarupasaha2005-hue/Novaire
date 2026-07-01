#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env};

#[soroban_sdk::contractclient(name = "PtTokenClient")]
pub trait PtTokenInterface {
    fn balance(env: Env, id: Address) -> i128;
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
}

#[soroban_sdk::contractclient(name = "TokenizerClient")]
pub trait TokenizerInterface {
    fn redeem_pt(env: Env, to: Address, amount: i128) -> i128;
}

#[soroban_sdk::contractclient(name = "UnderlyingTokenClient")]
pub trait UnderlyingTokenInterface {
    fn balance(env: Env, id: Address) -> i128;
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

#[soroban_sdk::contractclient(name = "IntentEngineClient")]
pub trait IntentEngineInterface {
    fn execute_fixed_yield_intent(
        env: Env,
        user: Address,
        usdc_amount: i128,
        min_implied_rate: i128,
        maturity_ledger: u32,
    ) -> IntentRecord;
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireRolloverError {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    PositionNotFound = 3,
    EpochNotExpired = 4,
    NextEpochNotSet = 5,
    PositionNotActive = 6,
    RateTooLow = 7,
    ZeroAmount = 8,
    StorageMissing = 9,
    MathOverflow = 10,
    MathUnderflow = 11,
    Paused = 12,
    InvariantViolation = 13,
    InvalidKeeper = 14,
    InvalidEpoch = 15,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Tokenizer,
    Vault,
    Marketplace,
    IntentEngine,
    Keeper,
    RolloverPositions(Address),
    PtToken,
    UnderlyingToken,
    Paused,
    GracePeriodLedgers,
    TotalPtHeld,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RolloverPosition {
    pub active: bool,
    pub pt_balance: i128,
    pub original_usdc: i128,
    pub current_epoch_maturity: u32,
    pub next_epoch_maturity: u32,
    pub min_rate_bps: i128,
    pub created_ledger: u32,
    pub last_rolled_ledger: u32,
    pub total_yield_earned: i128,
}

mod storage {
    use super::*;

    pub fn is_initialized(env: &Env) -> bool {
        env.storage().instance().has(&DataKey::Admin)
    }

    pub fn get_address(env: &Env, key: DataKey) -> Result<Address, NovaireRolloverError> {
        env.storage().instance().get(&key).ok_or(NovaireRolloverError::StorageMissing)
    }
    
    pub fn is_paused(env: &Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    pub fn set_paused(env: &Env, state: bool) {
        env.storage().instance().set(&DataKey::Paused, &state);
    }
    
    pub fn get_grace_period(env: &Env) -> u32 {
        env.storage().instance().get(&DataKey::GracePeriodLedgers).unwrap_or(17280) // default 1 day
    }

    pub fn get_total_pt_held(env: &Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalPtHeld).unwrap_or(0)
    }

    pub fn set_total_pt_held(env: &Env, amount: i128) {
        env.storage().instance().set(&DataKey::TotalPtHeld, &amount);
    }

    pub fn get_position(env: &Env, user: &Address) -> Result<RolloverPosition, NovaireRolloverError> {
        env.storage().persistent().get(&DataKey::RolloverPositions(user.clone()))
            .ok_or(NovaireRolloverError::PositionNotFound)
    }

    pub fn set_position(env: &Env, user: &Address, pos: &RolloverPosition) {
        env.storage().persistent().set(&DataKey::RolloverPositions(user.clone()), pos);
    }
    
    pub fn remove_position(env: &Env, user: &Address) {
        env.storage().persistent().remove(&DataKey::RolloverPositions(user.clone()));
    }
}

#[contract]
pub struct AutonomousRollover;

#[contractimpl]
impl AutonomousRollover {
    pub fn initialize(
        env: Env,
        admin: Address,
        tokenizer: Address,
        vault: Address,
        marketplace: Address,
        intent_engine: Address,
        keeper: Address,
        pt_token: Address,
        underlying_token: Address,
        grace_period_ledgers: u32,
    ) -> Result<(), NovaireRolloverError> {
        if storage::is_initialized(&env) {
            return Err(NovaireRolloverError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Tokenizer, &tokenizer);
        env.storage().instance().set(&DataKey::Vault, &vault);
        env.storage().instance().set(&DataKey::Marketplace, &marketplace);
        env.storage().instance().set(&DataKey::IntentEngine, &intent_engine);
        env.storage().instance().set(&DataKey::Keeper, &keeper);
        env.storage().instance().set(&DataKey::PtToken, &pt_token);
        env.storage().instance().set(&DataKey::UnderlyingToken, &underlying_token);
        env.storage().instance().set(&DataKey::GracePeriodLedgers, &grace_period_ledgers);
        
        storage::set_paused(&env, false);
        storage::set_total_pt_held(&env, 0);

        Ok(())
    }

    pub fn pause(env: Env) -> Result<(), NovaireRolloverError> {
        let admin = storage::get_address(&env, DataKey::Admin)?;
        admin.require_auth();
        storage::set_paused(&env, true);
        Ok(())
    }

    pub fn unpause(env: Env) -> Result<(), NovaireRolloverError> {
        let admin = storage::get_address(&env, DataKey::Admin)?;
        admin.require_auth();
        storage::set_paused(&env, false);
        Ok(())
    }

    pub fn register_rollover(
        env: Env,
        user: Address,
        pt_amount: i128,
        current_epoch_maturity: u32,
        next_epoch_maturity: u32,
        min_rate_bps: i128,
    ) -> Result<(), NovaireRolloverError> {
        user.require_auth();
        
        if storage::is_paused(&env) {
            return Err(NovaireRolloverError::Paused);
        }

        if pt_amount <= 0 {
            return Err(NovaireRolloverError::ZeroAmount);
        }
        if next_epoch_maturity <= current_epoch_maturity {
            return Err(NovaireRolloverError::InvalidEpoch);
        }

        let pt_token_addr = storage::get_address(&env, DataKey::PtToken)?;
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);

        let user_bal = pt_client.balance(&user);
        if user_bal < pt_amount {
            return Err(NovaireRolloverError::ZeroAmount); 
        }

        let contract_addr = env.current_contract_address();
        pt_client.transfer(&user, &contract_addr, &pt_amount);

        let position = RolloverPosition {
            active: true,
            pt_balance: pt_amount,
            original_usdc: pt_amount, 
            current_epoch_maturity,
            next_epoch_maturity,
            min_rate_bps,
            created_ledger: env.ledger().sequence(),
            last_rolled_ledger: env.ledger().sequence(),
            total_yield_earned: 0,
        };

        storage::set_position(&env, &user, &position);
        
        let current_total = storage::get_total_pt_held(&env);
        storage::set_total_pt_held(&env, current_total.checked_add(pt_amount).ok_or(NovaireRolloverError::MathOverflow)?);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "rollover_started"), user),
            (pt_amount, next_epoch_maturity),
        );

        Self::assert_invariant(&env)?;
        Ok(())
    }

    pub fn execute_rollover(env: Env, user: Address) -> Result<(), NovaireRolloverError> {
        if storage::is_paused(&env) {
            return Err(NovaireRolloverError::Paused);
        }

        let mut position = storage::get_position(&env, &user)?;
        if !position.active {
            return Err(NovaireRolloverError::PositionNotActive);
        }

        let current_ledger = env.ledger().sequence();
        if current_ledger < position.current_epoch_maturity {
            return Err(NovaireRolloverError::EpochNotExpired);
        }

        if position.next_epoch_maturity == 0 || position.next_epoch_maturity <= current_ledger {
            return Err(NovaireRolloverError::NextEpochNotSet);
        }

        // Keeper Fallback Grace Period
        let grace_period = storage::get_grace_period(&env);
        let grace_expiration = position.current_epoch_maturity.checked_add(grace_period).ok_or(NovaireRolloverError::MathOverflow)?;
        
        if current_ledger <= grace_expiration {
            let keeper = storage::get_address(&env, DataKey::Keeper)?;
            keeper.require_auth();
        } else {
            // Grace period expired, permissionless execution allowed to ensure liveness
        }

        let tokenizer_addr = storage::get_address(&env, DataKey::Tokenizer)?;
        let tokenizer_client = TokenizerClient::new(&env, &tokenizer_addr);
        let contract_addr = env.current_contract_address();

        // 1. Redeem PT
        let underlying_redeemed = tokenizer_client.redeem_pt(&contract_addr, &position.pt_balance);

        // 2. Calculate yield
        let yield_earned = underlying_redeemed.checked_sub(position.original_usdc).ok_or(NovaireRolloverError::MathUnderflow)?;

        // 3. Update yield
        position.total_yield_earned = position.total_yield_earned.checked_add(yield_earned).ok_or(NovaireRolloverError::MathOverflow)?;

        // 4. Intent Engine Fixed Yield Intent
        let intent_engine_addr = storage::get_address(&env, DataKey::IntentEngine)?;
        let intent_engine_client = IntentEngineClient::new(&env, &intent_engine_addr);
        
        let min_implied_rate = position.min_rate_bps.checked_mul(100_000).ok_or(NovaireRolloverError::MathOverflow)?;

        let intent_record = intent_engine_client.execute_fixed_yield_intent(
            &contract_addr,
            &underlying_redeemed,
            &min_implied_rate,
            &position.next_epoch_maturity,
        );

        // 5. Update position
        let old_pt = position.pt_balance;
        let new_pt = intent_record.pt_held;
        position.pt_balance = new_pt;
        position.original_usdc = underlying_redeemed;
        position.current_epoch_maturity = position.next_epoch_maturity;
        position.next_epoch_maturity = 0;
        position.last_rolled_ledger = current_ledger;

        storage::set_position(&env, &user, &position);

        let current_total = storage::get_total_pt_held(&env);
        let new_total = current_total.checked_sub(old_pt).ok_or(NovaireRolloverError::MathUnderflow)?
            .checked_add(new_pt).ok_or(NovaireRolloverError::MathOverflow)?;
        storage::set_total_pt_held(&env, new_total);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "rollover_completed"), user),
            (underlying_redeemed, new_pt, yield_earned),
        );

        Self::assert_invariant(&env)?;
        Ok(())
    }

    pub fn set_next_epoch(env: Env, user: Address, next_epoch_maturity: u32) -> Result<(), NovaireRolloverError> {
        user.require_auth();

        let mut position = storage::get_position(&env, &user)?;
        if !position.active {
            return Err(NovaireRolloverError::PositionNotActive);
        }

        if next_epoch_maturity <= position.current_epoch_maturity {
            return Err(NovaireRolloverError::InvalidEpoch);
        }

        position.next_epoch_maturity = next_epoch_maturity;
        storage::set_position(&env, &user, &position);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "next_epoch_set"), user),
            (next_epoch_maturity,),
        );

        Ok(())
    }

    pub fn exit_rollover(env: Env, user: Address) -> Result<(), NovaireRolloverError> {
        user.require_auth();
        // Allowed even if paused to prevent trapped funds

        let position = storage::get_position(&env, &user)?;
        if !position.active {
            return Err(NovaireRolloverError::PositionNotActive);
        }

        let pt_token_addr = storage::get_address(&env, DataKey::PtToken)?;
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);

        let contract_addr = env.current_contract_address();
        pt_client.transfer(&contract_addr, &user, &position.pt_balance);

        storage::remove_position(&env, &user);
        
        let current_total = storage::get_total_pt_held(&env);
        storage::set_total_pt_held(&env, current_total.checked_sub(position.pt_balance).ok_or(NovaireRolloverError::MathUnderflow)?);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "rollover_cancelled"), user),
            (position.pt_balance,),
        );

        Self::assert_invariant(&env)?;
        Ok(())
    }

    pub fn get_position(env: Env, user: Address) -> Result<RolloverPosition, NovaireRolloverError> {
        storage::get_position(&env, &user)
    }

    pub fn update_keeper(env: Env, new_keeper: Address) -> Result<(), NovaireRolloverError> {
        let admin = storage::get_address(&env, DataKey::Admin)?;
        admin.require_auth();

        env.storage().instance().set(&DataKey::Keeper, &new_keeper);
        
        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "keeper_updated"), new_keeper),
            (),
        );
        Ok(())
    }

    fn assert_invariant(env: &Env) -> Result<(), NovaireRolloverError> {
        let contract_addr = env.current_contract_address();
        
        let pt_token_addr = storage::get_address(env, DataKey::PtToken)?;
        let pt_client = PtTokenClient::new(env, &pt_token_addr);
        let actual_pt = pt_client.balance(&contract_addr);
        
        let total_pt_recorded = storage::get_total_pt_held(env);
        
        if actual_pt < total_pt_recorded {
            return Err(NovaireRolloverError::InvariantViolation);
        }
        
        // Assert no underlying is held in this contract (it's purely a router/custodian of PT)
        if let Ok(underlying_addr) = storage::get_address(env, DataKey::UnderlyingToken) {
            let underlying_client = UnderlyingTokenClient::new(env, &underlying_addr);
            if underlying_client.balance(&contract_addr) > 0 {
                return Err(NovaireRolloverError::InvariantViolation);
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod test;
