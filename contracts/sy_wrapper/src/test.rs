#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events},
    token, Address, Env, IntoVal, Symbol,
};

// --- Setup Helpers ---
struct Setup {
    env: Env,
    admin: Address,
    user1: Address,
    user2: Address,
    user3: Address,
    yield_source: Address,
    token_admin: Address,
    token_contract: Address,
    token_client: token::Client<'static>,
    token_admin_client: token::StellarAssetClient<'static>,
    contract_id: Address,
    client: SyWrapperClient<'static>,
}

fn setup_test() -> Setup {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);
    let yield_source = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(&env, &token_contract);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);

    let contract_id = env.register(SyWrapper, ());
    let client = SyWrapperClient::new(&env, &contract_id);

    Setup {
        env,
        admin,
        user1,
        user2,
        user3,
        yield_source,
        token_admin,
        token_contract,
        token_client,
        token_admin_client,
        contract_id,
        client,
    }
}

// ==========================================
// 1. Initialization Tests
// ==========================================

#[test]
fn test_initialize_success() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    assert_eq!(setup.client.get_exchange_rate(), EXCHANGE_RATE_SCALAR);
    assert_eq!(setup.client.total_shares(), 0);
    assert_eq!(setup.client.underlying_asset(), setup.token_contract);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_initialize_fails_twice() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
}

// ==========================================
// 2. Deposit Tests
// ==========================================

#[test]
fn test_normal_deposit() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &2000);
    let shares = setup.client.deposit(&setup.user1, &2000);

    assert_eq!(shares, 1000);
    assert_eq!(setup.client.total_shares(), 2000);
    assert_eq!(setup.token_client.balance(&setup.user1), 0);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 2000);
}

#[test]
fn test_multiple_deposits() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &3500);
    setup.client.deposit(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &1500);

    assert_eq!(setup.client.total_shares(), 3500);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 3500);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_deposit_zero() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    setup.client.deposit(&setup.user1, &0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #13)")]
fn test_deposit_under_minimum() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    setup.client.deposit(&setup.user1, &1000);
}

#[test]
fn test_extremely_large_deposits() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    let large_amount = i128::MAX / 1_000_000_000 - 1; // max safe amount before overflow in unchecked mul
    setup.token_admin_client.mint(&setup.user1, &large_amount);
    
    let shares = setup.client.deposit(&setup.user1, &large_amount);
    assert_eq!(shares, large_amount - 1000);
}

// ==========================================
// 3. Withdraw Tests
// ==========================================

#[test]
fn test_partial_withdraw() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &2000);

    let amount = setup.client.withdraw(&setup.user1, &400);
    assert_eq!(amount, 400);
    assert_eq!(setup.client.total_shares(), 1600);
    assert_eq!(setup.token_client.balance(&setup.user1), 400);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 1600);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_withdraw_zero_shares() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    setup.client.withdraw(&setup.user1, &0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_withdraw_more_than_exists() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    
    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &2000);
    
    setup.client.withdraw(&setup.user1, &2001);
}

// ==========================================
// 4. Real Yield Backing Tests
// ==========================================

#[test]
fn test_real_yield_backing() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &2000);

    // Initial state
    assert_eq!(setup.client.get_exchange_rate(), 1_000_000_000);
    assert_eq!(setup.client.total_shares(), 2000);

    // Simulate real yield: Yield source deposits 200 directly to contract (10%)
    setup.token_admin_client.mint(&setup.contract_id, &200);
    
    // Call harvest yield
    setup.client.harvest_yield();

    // Exchange rate should be exactly 1.1e9
    assert_eq!(setup.client.get_exchange_rate(), 1_100_000_000);
    assert_eq!(setup.client.total_shares(), 2000);

    // Withdraw 1000 shares
    let amount = setup.client.withdraw(&setup.user1, &1000);
    
    // User gets 1100 underlying (1000 shares * 1.1 rate)
    assert_eq!(amount, 1100);
    assert_eq!(setup.client.total_shares(), 1000); // 1000 dead shares remain
    assert_eq!(setup.token_client.balance(&setup.user1), 1100);
}

#[test]
fn test_solvency_invariant_holds() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.token_admin_client.mint(&setup.user2, &1000);

    setup.client.deposit(&setup.user1, &2000); // 1000 user shares + 1000 dead shares

    // Simulate yield: 200 underlying (10%)
    setup.token_admin_client.mint(&setup.contract_id, &200);
    setup.client.harvest_yield();
    assert_eq!(setup.client.get_exchange_rate(), 1_100_000_000);

    // User 2 deposits 1100 underlying at rate 1.1 -> gets 1000 shares
    setup.token_admin_client.mint(&setup.user2, &100);
    let user2_shares = setup.client.deposit(&setup.user2, &1100);
    assert_eq!(user2_shares, 1000);

    assert_eq!(setup.client.total_shares(), 3000);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 3300);

    // Solvency Check: Total underlying should equal exactly what shares are worth
    let rate = setup.client.get_exchange_rate();
    let expected_underlying = setup.client.total_shares() * rate / EXCHANGE_RATE_SCALAR;
    assert_eq!(setup.token_client.balance(&setup.contract_id), expected_underlying);

    // Withdrawals
    assert_eq!(setup.client.withdraw(&setup.user1, &1000), 1100);
    assert_eq!(setup.client.withdraw(&setup.user2, &1000), 1100);
    
    assert_eq!(setup.client.total_shares(), 1000); // 1000 dead shares remain
    assert_eq!(setup.token_client.balance(&setup.contract_id), 1100); // 1000 dead shares * 1.1 rate
}

#[test]
fn test_yield_cannot_increase_without_underlying_increasing() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &2000);

    let initial_rate = setup.client.get_exchange_rate();
    
    // Call harvest yield but NO new underlying tokens are added
    setup.client.harvest_yield();
    
    // Rate MUST remain exactly the same
    assert_eq!(setup.client.get_exchange_rate(), initial_rate);
}

// ==========================================
// 5. Previews
// ==========================================

#[test]
fn test_previews() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    
    assert_eq!(setup.client.preview_deposit(&1000), 1000);
    assert_eq!(setup.client.preview_withdraw(&1000), 1000);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &2000);

    // Simulate yield: 200 (10%)
    setup.token_admin_client.mint(&setup.contract_id, &200); 
    setup.client.harvest_yield();
    // rate = 1.1e9

    // 1000 amount -> 1000 * 1e9 / 1.1e9 = 909 shares
    assert_eq!(setup.client.preview_deposit(&1000), 909);
    // 1000 shares -> 1000 * 1.1e9 / 1e9 = 1100 amount
    assert_eq!(setup.client.preview_withdraw(&1000), 1100);
}

// ==========================================
// 6. Security & Remediation Tests
// ==========================================

#[test]
fn test_harvest_yield_donation_clamp() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    // Initial deposit: 2000
    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &2000);

    // Initial rate should be 1.0
    assert_eq!(setup.client.get_exchange_rate(), 1_000_000_000);

    // Unsolicited donation of 20% (400 tokens)
    setup.token_admin_client.mint(&setup.contract_id, &400);

    // Harvest yield. The internal actual balance is 2400 (a 20% increase).
    // The contract should clamp it to a 10% increase instead of reverting.
    setup.client.harvest_yield();

    // The exchange rate should be exactly 1.1 (10% increase)
    assert_eq!(setup.client.get_exchange_rate(), 1_100_000_000);

    // There are still 200 unclaimed tokens.
    // Call harvest_yield again. This time it will process up to 10% of the NEW rate.
    // 10% of 1.1 is 1.21. We only need it to go to 1.2.
    setup.client.harvest_yield();

    // Now the rate should be 1.2 (2400 / 2000)
    assert_eq!(setup.client.get_exchange_rate(), 1_200_000_000);
}
