#![cfg(test)]

use super::*;
use soroban_sdk::{
    contract, contractimpl,
    testutils::{Address as _, Ledger},
    token, Address, Env, IntoVal,
};

// ==========================================
// MOCK YIELD VAULT FOR INTEGRATION
// ==========================================

#[contract]
pub struct MockYieldVault;

#[contractimpl]
impl MockYieldVault {
    pub fn deposit_into_sy(env: Env, sy: Address, user: Address, amount: i128) -> i128 {
        user.require_auth();
        let sy_client = SyWrapperClient::new(&env, &sy);
        sy_client.deposit(&user, &amount)
    }

    pub fn withdraw_from_sy(env: Env, sy: Address, user: Address, shares: i128) -> i128 {
        user.require_auth();
        let sy_client = SyWrapperClient::new(&env, &sy);
        sy_client.withdraw(&user, &shares)
    }
}

// ==========================================
// SETUP UTILITIES
// ==========================================

struct AuditSetup {
    env: Env,
    admin: Address,
    user1: Address,
    user2: Address,
    user3: Address,
    yield_source: Address,
    token_admin_client: token::StellarAssetClient<'static>,
    token_client: token::Client<'static>,
    token_contract: Address,
    contract_id: Address,
    client: SyWrapperClient<'static>,
    vault_id: Address,
}

fn setup() -> AuditSetup {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);
    let yield_source = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin).address();
    let token_client = token::Client::new(&env, &token_contract);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);

    let contract_id = env.register(SyWrapper, ());
    let client = SyWrapperClient::new(&env, &contract_id);
    client.initialize(&admin, &token_contract, &yield_source);

    let vault_id = env.register(MockYieldVault, ());

    AuditSetup {
        env,
        admin,
        user1,
        user2,
        user3,
        yield_source,
        token_admin_client,
        token_client,
        token_contract,
        contract_id,
        client,
        vault_id,
    }
}

fn assert_invariant_total_shares_sum(s: &AuditSetup, u1_shares: i128, u2_shares: i128, u3_shares: i128) {
    let expected = u1_shares + u2_shares + u3_shares;
    assert_eq!(s.client.total_shares(), expected, "Invariant violation: total shares sum mismatch");
}

fn assert_invariant_rate_monotonicity(s: &AuditSetup, previous_rate: i128) {
    assert!(s.client.get_exchange_rate() >= previous_rate, "Invariant violation: rate decreased");
}

// ==========================================
// 1. PROTOCOL INVARIANTS & 2. MULTI-USER
// ==========================================

#[test]
fn test_invariant_accounting_across_complex_transitions() {
    let s = setup();
    
    // User 1 deposits 20k (1k locked) -> 19k shares
    s.token_admin_client.mint(&s.user1, &20_000);
    let u1_s1 = s.client.deposit(&s.user1, &20_000);
    assert_eq!(u1_s1, 19_000);
    assert_invariant_total_shares_sum(&s, u1_s1, 0, 1000); // 1000 dead shares

    // Yield accrues: 10% of 20k = 2k
    s.token_admin_client.mint(&s.contract_id, &2_000);
    s.client.harvest_yield(); // Rate becomes 1.1
    
    // User 2 deposits 11k -> gets 10k shares (11k * 1 / 1.1)
    s.token_admin_client.mint(&s.user2, &11_000);
    let u2_s1 = s.client.deposit(&s.user2, &11_000);
    assert_eq!(u2_s1, 10_000); 
    assert_invariant_total_shares_sum(&s, u1_s1, u2_s1, 1000);

    // Yield accrues: 10% of 33k (20k + 2k + 11k) = 3.3k
    s.token_admin_client.mint(&s.contract_id, &3_300);
    s.client.harvest_yield(); // Rate becomes 36.3k / 30k = 1.21
    
    // User 3 deposits 12.1k -> gets 10k shares (12.1k * 1 / 1.21)
    s.token_admin_client.mint(&s.user3, &12_100);
    let u3_s1 = s.client.deposit(&s.user3, &12_100);
    assert_eq!(u3_s1, 10_000);
    assert_invariant_total_shares_sum(&s, u1_s1, u2_s1, u3_s1 + 1000);

    // Withdrawals (Rate is 1.21)
    let u1_out = s.client.withdraw(&s.user1, &u1_s1);
    assert_eq!(u1_out, 22_990); // 19k shares * 1.21
    assert_invariant_total_shares_sum(&s, 0, u2_s1, u3_s1 + 1000);

    let u2_out = s.client.withdraw(&s.user2, &u2_s1);
    assert_eq!(u2_out, 12_100); // 10k shares * 1.21
    assert_invariant_total_shares_sum(&s, 0, 0, u3_s1 + 1000);

    let u3_out = s.client.withdraw(&s.user3, &u3_s1);
    assert_eq!(u3_out, 12_100);
    assert_invariant_total_shares_sum(&s, 0, 0, 1000);

    assert_eq!(s.client.total_shares(), 1000); // Only dead shares left
}

#[test]
fn test_invariants_during_back_to_back_deposits_withdraws() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &100_000);
    
    // Repeated cycle to check precision drift
    // First deposit must be > 1000
    let mut shares = 0;
    shares += s.client.deposit(&s.user1, &2_000); // 1000 user shares + 1000 dead
    for _ in 0..9 {
        shares += s.client.deposit(&s.user1, &1_000);
    }
    assert_eq!(shares, 10_000);
    assert_eq!(s.client.total_shares(), 11_000);

    let withdrawn = s.client.withdraw(&s.user1, &10_000);
    assert_eq!(withdrawn, 10_000);
    assert_eq!(s.client.total_shares(), 1000); // 1000 dead remain
}

// ==========================================
// 3. RANDOMIZED STRESS TESTS
// ==========================================

#[test]
fn test_stress_randomized_operations() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &1_000_000_000);

    let mut current_rate = 1_000_000_000;
    let mut u1_shares = 0;

    let operations = [
        ("deposit", 12345, 0), // min threshold cleared here
        ("yield", 0, 1000), // < 10% of 12345
        ("deposit", 999, 0),
        ("withdraw", 500, 0),
        ("deposit", 88888, 0),
        ("yield", 0, 8000), // < 10%
        ("withdraw", 1000, 0),
        ("yield", 0, 9000), // < 10%
        ("deposit", 1000, 0),
        ("withdraw", 10, 0),
    ];

    for (op, val, yield_val) in operations {
        if op == "deposit" {
            u1_shares += s.client.deposit(&s.user1, &val);
        } else if op == "withdraw" {
            let _out = s.client.withdraw(&s.user1, &val);
            u1_shares -= val;
        } else if op == "yield" {
            s.token_admin_client.mint(&s.contract_id, &yield_val);
            s.client.harvest_yield();
        }

        let new_rate = s.client.get_exchange_rate();
        assert_invariant_rate_monotonicity(&s, current_rate);
        current_rate = new_rate;
    }

    assert_eq!(s.client.total_shares(), u1_shares + 1000); // user shares + dead shares
}
