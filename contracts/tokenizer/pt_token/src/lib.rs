#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

#[contract]
pub struct PtToken;

#[contractimpl]
impl PtToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "name"), &String::from_str(&env, "Novaire Principal Token"));
        env.storage().instance().set(&Symbol::new(&env, "symbol"), &String::from_str(&env, "nPT"));
        env.storage().instance().set(&Symbol::new(&env, "decimals"), &7u32);
        env.storage().instance().set(&Symbol::new(&env, "total_supply"), &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();
        if amount < 0 { panic!("negative amount"); }

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
