#![cfg(test)]

use super::*;
use soroban_sdk::{
    contract, contractimpl,
    testutils::{Address as _, Ledger},
    token, Address, Env, IntoVal, Symbol,
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
    
    // User 1 deposits
    s.token_admin_client.mint(&s.user1, &10_000);
    let u1_s1 = s.client.deposit(&s.user1, &10_000);
    assert_eq!(u1_s1, 10_000);
    assert_invariant_total_shares_sum(&s, u1_s1, 0, 0);

    // Yield accrues
    s.token_admin_client.mint(&s.contract_id, &5_000); // simulate yield influx (rate goes to 1.5)
    s.client.harvest_yield();
    
    // Check balances
    assert_eq!(s.client.preview_withdraw(&u1_s1), 15_000);
    
    // User 2 deposits
    s.token_admin_client.mint(&s.user2, &15_000);
    let u2_s1 = s.client.deposit(&s.user2, &15_000);
    assert_eq!(u2_s1, 10_000); // 15_000 * 1e9 / 1.5e9
    assert_invariant_total_shares_sum(&s, u1_s1, u2_s1, 0);

    // More yield
    s.token_admin_client.mint(&s.contract_id, &10_000); // add 10k more (total 40k underlying, 20k shares -> rate 2.0)
    s.client.harvest_yield();
    
    // User 3 deposits
    s.token_admin_client.mint(&s.user3, &8_000);
    let u3_s1 = s.client.deposit(&s.user3, &8_000);
    assert_eq!(u3_s1, 4_000); // 8_000 * 1e9 / 2e9
    assert_invariant_total_shares_sum(&s, u1_s1, u2_s1, u3_s1);

    // Withdrawals
    let u1_out = s.client.withdraw(&s.user1, &u1_s1);
    assert_eq!(u1_out, 20_000); // 10k shares * 2
    assert_invariant_total_shares_sum(&s, 0, u2_s1, u3_s1);

    let u2_out = s.client.withdraw(&s.user2, &u2_s1);
    assert_eq!(u2_out, 20_000);
    assert_invariant_total_shares_sum(&s, 0, 0, u3_s1);

    let u3_out = s.client.withdraw(&s.user3, &u3_s1);
    assert_eq!(u3_out, 8_000);
    assert_invariant_total_shares_sum(&s, 0, 0, 0);

    assert_eq!(s.client.total_shares(), 0);
}

#[test]
fn test_invariants_during_back_to_back_deposits_withdraws() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &100_000);
    
    // Repeated cycle to check precision drift
    let mut shares = 0;
    for _ in 0..10 {
        shares += s.client.deposit(&s.user1, &1_000);
    }
    assert_eq!(shares, 10_000);
    assert_eq!(s.client.total_shares(), 10_000);

    let withdrawn = s.client.withdraw(&s.user1, &10_000);
    assert_eq!(withdrawn, 10_000);
    assert_eq!(s.client.total_shares(), 0);
}

// ==========================================
// 3. RANDOMIZED STRESS TESTS
// ==========================================

#[test]
fn test_stress_randomized_operations() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &1_000_000_000);
    s.token_admin_client.mint(&s.contract_id, &1_000_000_000); // Huge buffer for yield

    let mut current_rate = 1_000_000_000;
    let mut u1_shares = 0;

    let operations = [
        ("deposit", 12345, 0),
        ("yield", 0, 500),
        ("deposit", 999, 0),
        ("withdraw", 500, 0),
        ("deposit", 88888, 0),
        ("yield", 0, 1111),
        ("withdraw", 1000, 0),
        ("yield", 0, 20000),
        ("deposit", 1, 0),
        ("withdraw", 1, 0),
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

    assert_eq!(s.client.total_shares(), u1_shares);
}
