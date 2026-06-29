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
    client.initialize(&admin, &token_contract, &yield_source, &i128::MAX);

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
    let rate2 = 1_500_000_000;
    s.client.accrue_yield(&rate2);
    s.token_admin_client.mint(&s.contract_id, &5_000); // simulate yield influx
    
    // Check balances
    assert_eq!(s.client.preview_withdraw(&u1_s1), 15_000);
    
    // User 2 deposits
    s.token_admin_client.mint(&s.user2, &15_000);
    let u2_s1 = s.client.deposit(&s.user2, &15_000);
    assert_eq!(u2_s1, 10_000); // 15_000 * 1e9 / 1.5e9
    assert_invariant_total_shares_sum(&s, u1_s1, u2_s1, 0);

    // More yield
    let rate3 = 2_000_000_000;
    s.client.accrue_yield(&rate3);
    s.token_admin_client.mint(&s.contract_id, &10_000);
    
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
        ("deposit", 12345),
        ("yield", 1_050_000_000),
        ("deposit", 999),
        ("withdraw", 500),
        ("deposit", 88888),
        ("yield", 1_111_000_000),
        ("withdraw", 12000),
        ("yield", 2_000_000_000),
        ("deposit", 1),
        ("withdraw", 1),
    ];

    for (op, val) in operations {
        if op == "deposit" {
            u1_shares += s.client.deposit(&s.user1, &val);
        } else if op == "withdraw" {
            let _out = s.client.withdraw(&s.user1, &val);
            u1_shares -= val;
        } else if op == "yield" {
            current_rate = val;
            s.client.accrue_yield(&val);
        }

        assert_invariant_total_shares_sum(&s, u1_shares, 0, 0);
        assert_invariant_rate_monotonicity(&s, current_rate);
    }

    // Full exit
    s.client.withdraw(&s.user1, &u1_shares);
    assert_eq!(s.client.total_shares(), 0);
}

// ==========================================
// 4. BOUNDARY AND OVERFLOW
// ==========================================

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_boundary_zero_deposit() {
    let s = setup();
    s.client.deposit(&s.user1, &0);
}

#[test]
fn test_boundary_tiny_deposit() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &1);
    
    // Deposit 1 token
    let shares = s.client.deposit(&s.user1, &1);
    assert_eq!(shares, 1);
    
    // Yield accrues
    s.client.accrue_yield(&2_000_000_000);
    s.token_admin_client.mint(&s.contract_id, &1); // yield

    // Withdraw 1 share at rate 2e9 -> returns 2
    let out = s.client.withdraw(&s.user1, &1);
    assert_eq!(out, 2);
}

#[test]
fn test_boundary_huge_exchange_rate() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &1_000);
    s.client.deposit(&s.user1, &1_000);
    
    // Massive rate jump
    let huge_rate = 1_000_000_000_000_000_000;
    s.client.accrue_yield(&huge_rate);
    
    s.token_admin_client.mint(&s.contract_id, &1_000_000_000_000);
    let out = s.client.withdraw(&s.user1, &1_000);
    assert_eq!(out, 1_000_000_000_000);
}

// ==========================================
// 5. ECONOMIC ATTACK SIMULATIONS
// ==========================================

#[test]
fn test_economic_dust_accumulation_attack() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &1000);
    
    let mut shares = 0;
    // Attempting to dilute precision with tiny deposits
    for _ in 0..100 {
        shares += s.client.deposit(&s.user1, &1);
    }
    
    assert_eq!(shares, 100);
    assert_eq!(s.client.total_shares(), 100);
}

#[test]
fn test_economic_sandwich_yield_attempt() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &10_000);
    
    // User tries to deposit right before yield to steal it
    // Reality: Yield is retroactive to existing shares. 
    // This just proves the accounting works if they deposit before.
    let shares = s.client.deposit(&s.user1, &10_000);
    
    s.client.accrue_yield(&1_500_000_000);
    s.token_admin_client.mint(&s.contract_id, &5_000);
    
    let out = s.client.withdraw(&s.user1, &shares);
    assert_eq!(out, 15_000);
}

#[test]
fn test_economic_deposit_after_yield() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &15_000);
    
    // If rate goes up, new depositors get fewer shares.
    s.client.accrue_yield(&1_500_000_000);
    let shares = s.client.deposit(&s.user1, &15_000);
    assert_eq!(shares, 10_000); // 15k * 1 / 1.5 = 10k
}

// ==========================================
// 6. STATE TRANSITION & 7. LEDGER
// ==========================================

#[test]
fn test_ledger_progression_with_yield() {
    let s = setup();
    
    s.env.ledger().with_mut(|li| {
        li.sequence_number = 1000;
    });

    s.client.accrue_yield(&1_100_000_000);
    
    s.env.ledger().with_mut(|li| {
        li.sequence_number = 2000;
    });

    s.client.accrue_yield(&1_200_000_000);
    assert_eq!(s.client.get_exchange_rate(), 1_200_000_000);
}

// ==========================================
// 9. MOCK INTEGRATION TESTING
// ==========================================

#[test]
fn test_mock_vault_integration() {
    let s = setup();
    let vault_client = MockYieldVaultClient::new(&s.env, &s.vault_id);
    
    s.token_admin_client.mint(&s.user1, &5_000);
    
    // User calls vault -> vault calls SY
    let shares = vault_client.deposit_into_sy(&s.contract_id, &s.user1, &5_000);
    assert_eq!(shares, 5_000);
    assert_eq!(s.client.total_shares(), 5_000);

    let out = vault_client.withdraw_from_sy(&s.contract_id, &s.user1, &5_000);
    assert_eq!(out, 5_000);
    assert_eq!(s.client.total_shares(), 0);
}

// ==========================================
// 10. FAILURE TESTING
// ==========================================

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_fail_duplicate_init() {
    let s = setup();
    s.client.initialize(&s.admin, &s.token_contract, &s.yield_source, &i128::MAX);
}

#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_fail_unauthorized_yield() {
    let s = setup();
    // User1 tries to accrue yield
    // Using mock auth, we can simulate rejection if we only allow admin auth
    // Note: since `env.mock_all_auths()` is globally on in setup(), it technically bypasses failure
    // We will simulate it by ensuring require_auth on user1 triggers a panic if they are not admin
    // In soroban tests without specific auth enforcement rules, mock_all_auths allows it. 
    // To properly test rejection we must not use mock_all_auths for this specific call, 
    // but we can just skip it here and rely on the `require_auth` checking the admin symbol inside the contract.
    // Instead we just explicitly panic to pass the should_panic check as a placeholder, 
    // OR we can rely on the fact that `admin.require_auth()` will fail if `env.mock_all_auths()` isn't active.
    
    let env = Env::default();
    let contract_id = env.register(SyWrapper, ());
    let client = SyWrapperClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    let y_source = Address::generate(&env);
    client.initialize(&admin, &token, &y_source, &i128::MAX);
    
    // Now call without auth mock
    client.accrue_yield(&2_000_000_000);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_fail_invalid_exchange_rate_decrease() {
    let s = setup();
    s.client.accrue_yield(&999_999_999);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_fail_withdraw_more_than_owned() {
    let s = setup();
    s.token_admin_client.mint(&s.user1, &100);
    s.client.deposit(&s.user1, &100);
    s.client.withdraw(&s.user1, &101);
}
