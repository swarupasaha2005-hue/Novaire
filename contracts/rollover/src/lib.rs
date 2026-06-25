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
    RolloverPositions(Address), // Address -> RolloverPosition
    PtToken, // Need to store PT token addr if we pull tokens
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
    ) -> Result<(), NovaireRolloverError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(NovaireRolloverError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Tokenizer, &tokenizer);
        env.storage().instance().set(&DataKey::Vault, &vault);
        env.storage().instance().set(&DataKey::Marketplace, &marketplace);
        env.storage().instance().set(&DataKey::IntentEngine, &intent_engine);
        env.storage().instance().set(&DataKey::Keeper, &keeper);
        env.storage().instance().set(&DataKey::PtToken, &pt_token);
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
        
        if pt_amount <= 0 {
            return Err(NovaireRolloverError::ZeroAmount);
        }

        let pt_token_addr: Address = env.storage().instance().get(&DataKey::PtToken).unwrap();
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);

        let user_bal = pt_client.balance(&user);
        if user_bal < pt_amount {
            return Err(NovaireRolloverError::ZeroAmount); // could add specific error but keeping simple
        }

        let contract_addr = env.current_contract_address();
        pt_client.transfer(&user, &contract_addr, &pt_amount);

        let position = RolloverPosition {
            active: true,
            pt_balance: pt_amount,
            original_usdc: pt_amount, // initially assuming 1 PT ≈ 1 USDC at maturity
            current_epoch_maturity,
            next_epoch_maturity,
            min_rate_bps,
            created_ledger: env.ledger().sequence(),
            last_rolled_ledger: env.ledger().sequence(),
            total_yield_earned: 0,
        };

        env.storage().persistent().set(&DataKey::RolloverPositions(user.clone()), &position);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "rollover_registered"), user),
            (pt_amount, next_epoch_maturity),
        );

        Ok(())
    }

    pub fn execute_rollover(env: Env, user: Address) -> Result<(), NovaireRolloverError> {
        let keeper: Address = env.storage().instance().get(&DataKey::Keeper).unwrap();
        keeper.require_auth();

        let mut position: RolloverPosition = env.storage().persistent().get(&DataKey::RolloverPositions(user.clone()))
            .ok_or(NovaireRolloverError::PositionNotFound)?;

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

        let tokenizer_addr: Address = env.storage().instance().get(&DataKey::Tokenizer).unwrap();
        let tokenizer_client = TokenizerClient::new(&env, &tokenizer_addr);
        
        let contract_addr = env.current_contract_address();

        // Step 1: Redeem PT
        let underlying_redeemed = tokenizer_client.redeem_pt(&contract_addr, &position.pt_balance);

        // Step 2: Calculate yield
        let yield_earned = underlying_redeemed - position.original_usdc;

        // Step 3: Update yield
        position.total_yield_earned += yield_earned;

        // Step 4: Intent Engine Fixed Yield Intent
        let intent_engine_addr: Address = env.storage().instance().get(&DataKey::IntentEngine).unwrap();
        let intent_engine_client = IntentEngineClient::new(&env, &intent_engine_addr);
        
        let min_implied_rate = position.min_rate_bps * 100_000;

        let intent_record = intent_engine_client.execute_fixed_yield_intent(
            &contract_addr,
            &underlying_redeemed,
            &min_implied_rate,
            &position.next_epoch_maturity,
        );

        // Step 5: Update position
        let new_pt = intent_record.pt_held;
        position.pt_balance = new_pt;
        position.original_usdc = underlying_redeemed;
        position.current_epoch_maturity = position.next_epoch_maturity;
        position.next_epoch_maturity = 0;
        position.last_rolled_ledger = current_ledger;

        env.storage().persistent().set(&DataKey::RolloverPositions(user.clone()), &position);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "rollover_executed"), user),
            (underlying_redeemed, new_pt, yield_earned),
        );

        Ok(())
    }

    pub fn set_next_epoch(env: Env, user: Address, next_epoch_maturity: u32) -> Result<(), NovaireRolloverError> {
        user.require_auth();

        let mut position: RolloverPosition = env.storage().persistent().get(&DataKey::RolloverPositions(user.clone()))
            .ok_or(NovaireRolloverError::PositionNotFound)?;

        if !position.active {
            return Err(NovaireRolloverError::PositionNotActive);
        }

        position.next_epoch_maturity = next_epoch_maturity;
        env.storage().persistent().set(&DataKey::RolloverPositions(user.clone()), &position);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "next_epoch_set"), user),
            (next_epoch_maturity,),
        );

        Ok(())
    }

    pub fn exit_rollover(env: Env, user: Address) -> Result<(), NovaireRolloverError> {
        user.require_auth();

        let position: RolloverPosition = env.storage().persistent().get(&DataKey::RolloverPositions(user.clone()))
            .ok_or(NovaireRolloverError::PositionNotFound)?;

        if !position.active {
            return Err(NovaireRolloverError::PositionNotActive);
        }

        let pt_token_addr: Address = env.storage().instance().get(&DataKey::PtToken).unwrap();
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);

        let contract_addr = env.current_contract_address();
        pt_client.transfer(&contract_addr, &user, &position.pt_balance);

        env.storage().persistent().remove(&DataKey::RolloverPositions(user.clone()));

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "rollover_exited"), user),
            (position.pt_balance,),
        );

        Ok(())
    }

    pub fn get_position(env: Env, user: Address) -> Result<RolloverPosition, NovaireRolloverError> {
        env.storage().persistent().get(&DataKey::RolloverPositions(user))
            .ok_or(NovaireRolloverError::PositionNotFound)
    }

    pub fn update_keeper(env: Env, new_keeper: Address) -> Result<(), NovaireRolloverError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        env.storage().instance().set(&DataKey::Keeper, &new_keeper);
        Ok(())
    }
}

#[cfg(test)]
mod test;
