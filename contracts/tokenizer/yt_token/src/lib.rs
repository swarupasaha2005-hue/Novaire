#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

#[contract]
pub struct YtToken;

#[contractimpl]
impl YtToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "name"), &String::from_str(&env, "Novaire Yield Token"));
        env.storage().instance().set(&Symbol::new(&env, "symbol"), &String::from_str(&env, "nYT"));
        env.storage().instance().set(&Symbol::new(&env, "decimals"), &7u32);
        env.storage().instance().set(&Symbol::new(&env, "total_supply"), &0i128);
        env.storage().instance().set(&Symbol::new(&env, "yield_index"), &0i128);
    }

    pub fn set_maturity(env: Env, maturity_ledger: u32) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        if env.storage().instance().has(&Symbol::new(&env, "maturity_ledger")) {
            panic!("maturity already set");
        }
        env.storage().instance().set(&Symbol::new(&env, "maturity_ledger"), &maturity_ledger);
    }

    pub fn is_expired(env: Env) -> bool {
        let maturity_ledger: u32 = env.storage().instance().get(&Symbol::new(&env, "maturity_ledger")).unwrap();
        env.ledger().sequence() >= maturity_ledger
    }

    pub fn update_yield_index(env: Env, new_index: i128) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        let current_index: i128 = env.storage().instance().get(&Symbol::new(&env, "yield_index")).unwrap_or(0);
        if new_index < current_index {
            panic!("index cannot decrease");
        }
        env.storage().instance().set(&Symbol::new(&env, "yield_index"), &new_index);
    }

    pub fn checkpoint_user(env: Env, user: Address) {
        let current_index: i128 = env.storage().instance().get(&Symbol::new(&env, "yield_index")).unwrap_or(0);
        let user_index_key = (Symbol::new(&env, "user_yield_index"), user.clone());
        let user_index: i128 = env.storage().persistent().get(&user_index_key).unwrap_or(0);
        
        let balance_key = (Symbol::new(&env, "balance"), user.clone());
        let balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);

        if balance > 0 && current_index > user_index {
            let yield_earned = (current_index - user_index).checked_mul(balance).unwrap() / 1_000_000_000;
            let accrued_key = (Symbol::new(&env, "accrued_yield"), user.clone());
            let mut accrued: i128 = env.storage().persistent().get(&accrued_key).unwrap_or(0);
            accrued += yield_earned;
            env.storage().persistent().set(&accrued_key, &accrued);
        }
        
        env.storage().persistent().set(&user_index_key, &current_index);
    }

    pub fn claimable_yield(env: Env, user: Address) -> i128 {
        let accrued_key = (Symbol::new(&env, "accrued_yield"), user.clone());
        let accrued: i128 = env.storage().persistent().get(&accrued_key).unwrap_or(0);
        
        let current_index: i128 = env.storage().instance().get(&Symbol::new(&env, "yield_index")).unwrap_or(0);
        let user_index: i128 = env.storage().persistent().get(&(Symbol::new(&env, "user_yield_index"), user.clone())).unwrap_or(0);
        let balance: i128 = env.storage().persistent().get(&(Symbol::new(&env, "balance"), user.clone())).unwrap_or(0);
        
        let mut pending = 0;
        if balance > 0 && current_index > user_index {
            pending = (current_index - user_index).checked_mul(balance).unwrap() / 1_000_000_000;
        }
        accrued + pending
    }

    pub fn reset_claimable(env: Env, user: Address) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        Self::checkpoint_user(env.clone(), user.clone());
        let accrued_key = (Symbol::new(&env, "accrued_yield"), user);
        env.storage().persistent().set(&accrued_key, &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        if amount < 0 { panic!("negative amount"); }

        Self::checkpoint_user(env.clone(), to.clone());

        let mut total_supply: i128 = env.storage().instance().get(&Symbol::new(&env, "total_supply")).unwrap();
        total_supply += amount;
        env.storage().instance().set(&Symbol::new(&env, "total_supply"), &total_supply);

        let to_key = (Symbol::new(&env, "balance"), to.clone());
        let mut balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&to_key, &balance);

        env.events().publish((Symbol::new(&env, "mint"), admin, to), amount);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        if amount < 0 { panic!("negative amount"); }

        Self::checkpoint_user(env.clone(), from.clone());

        let from_key = (Symbol::new(&env, "balance"), from.clone());
        let mut balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if balance < amount { panic!("insufficient balance"); }
        
        balance -= amount;
        env.storage().persistent().set(&from_key, &balance);

        let mut total_supply: i128 = env.storage().instance().get(&Symbol::new(&env, "total_supply")).unwrap();
        total_supply -= amount;
        env.storage().instance().set(&Symbol::new(&env, "total_supply"), &total_supply);

        env.events().publish((Symbol::new(&env, "burn"), from), amount);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        if amount < 0 { panic!("negative amount"); }
        
        Self::checkpoint_user(env.clone(), from.clone());
        Self::checkpoint_user(env.clone(), to.clone());

        let from_key = (Symbol::new(&env, "balance"), from.clone());
        let mut from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount { panic!("insufficient balance"); }
        from_balance -= amount;
        env.storage().persistent().set(&from_key, &from_balance);

        let to_key = (Symbol::new(&env, "balance"), to.clone());
        let mut to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        to_balance += amount;
        env.storage().persistent().set(&to_key, &to_balance);

        env.events().publish((Symbol::new(&env, "transfer"), from, to), amount);
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        if amount < 0 { panic!("negative amount"); }

        Self::checkpoint_user(env.clone(), from.clone());
        Self::checkpoint_user(env.clone(), to.clone());

        let allowance_key = (Symbol::new(&env, "allowance"), from.clone(), spender.clone());
        let mut allowance: i128 = env.storage().persistent().get(&allowance_key).unwrap_or(0);
        if allowance < amount { panic!("insufficient allowance"); }
        allowance -= amount;
        env.storage().persistent().set(&allowance_key, &allowance);

        let from_key = (Symbol::new(&env, "balance"), from.clone());
        let mut from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount { panic!("insufficient balance"); }
        from_balance -= amount;
        env.storage().persistent().set(&from_key, &from_balance);

        let to_key = (Symbol::new(&env, "balance"), to.clone());
        let mut to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        to_balance += amount;
        env.storage().persistent().set(&to_key, &to_balance);

        env.events().publish((Symbol::new(&env, "transfer"), from, to), amount);
    }

    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, _expiry_ledger: u32) {
        from.require_auth();
        if amount < 0 { panic!("negative amount"); }
        let allowance_key = (Symbol::new(&env, "allowance"), from.clone(), spender.clone());
        env.storage().persistent().set(&allowance_key, &amount);
        env.events().publish((Symbol::new(&env, "approve"), from, spender), amount);
    }

    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        env.storage().persistent().get(&(Symbol::new(&env, "allowance"), from, spender)).unwrap_or(0)
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&(Symbol::new(&env, "balance"), id)).unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&Symbol::new(&env, "total_supply")).unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&Symbol::new(&env, "name")).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&Symbol::new(&env, "symbol")).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&Symbol::new(&env, "decimals")).unwrap()
    }
}
