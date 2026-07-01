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

    setup.token_admin_client.mint(&setup.user1, &1000);
    let shares = setup.client.deposit(&setup.user1, &1000);

    assert_eq!(shares, 1000);
    assert_eq!(setup.client.total_shares(), 1000);
    assert_eq!(setup.token_client.balance(&setup.user1), 0);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 1000);
}

#[test]
fn test_multiple_deposits() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &500);
    setup.client.deposit(&setup.user1, &1500);

    assert_eq!(setup.client.total_shares(), 2000);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 2000);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_deposit_zero() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);
    setup.client.deposit(&setup.user1, &0);
}

#[test]
fn test_extremely_large_deposits() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    let large_amount = i128::MAX / 1_000_000_000 - 1; // max safe amount before overflow in unchecked mul
    setup.token_admin_client.mint(&setup.user1, &large_amount);
    
    let shares = setup.client.deposit(&setup.user1, &large_amount);
    assert_eq!(shares, large_amount);
}

// ==========================================
// 3. Withdraw Tests
// ==========================================

#[test]
fn test_partial_withdraw() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

    let amount = setup.client.withdraw(&setup.user1, &400);
    assert_eq!(amount, 400);
    assert_eq!(setup.client.total_shares(), 600);
    assert_eq!(setup.token_client.balance(&setup.user1), 400);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 600);
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
    
    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);
    
    setup.client.withdraw(&setup.user1, &1001);
}

// ==========================================
// 4. Real Yield Backing Tests
// ==========================================

#[test]
fn test_real_yield_backing() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

    // Initial state
    assert_eq!(setup.client.get_exchange_rate(), 1_000_000_000);
    assert_eq!(setup.client.total_shares(), 1000);

    // Simulate real yield: Yield source deposits 500 directly to contract
    setup.token_admin_client.mint(&setup.contract_id, &500);
    
    // Call harvest yield (only emits event, exchange rate is inherently updated)
    setup.client.harvest_yield();

    // Exchange rate should naturally be 1.5e9
    assert_eq!(setup.client.get_exchange_rate(), 1_500_000_000);
    assert_eq!(setup.client.total_shares(), 1000);

    // Withdraw 1000 shares
    let amount = setup.client.withdraw(&setup.user1, &1000);
    
    // User gets 1500 underlying (1000 original + 500 yield)
    assert_eq!(amount, 1500);
    assert_eq!(setup.client.total_shares(), 0);
    assert_eq!(setup.token_client.balance(&setup.user1), 1500);
}

#[test]
fn test_solvency_invariant_holds() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.token_admin_client.mint(&setup.user2, &1000);

    setup.client.deposit(&setup.user1, &1000); // 1000 shares

    // Simulate yield
    setup.token_admin_client.mint(&setup.contract_id, &1000); // 1000 shares = 2000 underlying -> rate 2.0
    assert_eq!(setup.client.get_exchange_rate(), 2_000_000_000);

    // User 2 deposits 1000 underlying at rate 2.0 -> gets 500 shares
    let user2_shares = setup.client.deposit(&setup.user2, &1000);
    assert_eq!(user2_shares, 500);

    assert_eq!(setup.client.total_shares(), 1500);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 3000);

    // Solvency Check: Total underlying should equal exactly what shares are worth
    let rate = setup.client.get_exchange_rate();
    let expected_underlying = setup.client.total_shares() * rate / EXCHANGE_RATE_SCALAR;
    assert_eq!(setup.token_client.balance(&setup.contract_id), expected_underlying);

    // Withdrawals
    assert_eq!(setup.client.withdraw(&setup.user1, &1000), 2000);
    assert_eq!(setup.client.withdraw(&setup.user2, &500), 1000);
    
    assert_eq!(setup.client.total_shares(), 0);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 0);
}

#[test]
fn test_yield_cannot_increase_without_underlying_increasing() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

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

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

    // Simulate yield
    setup.token_admin_client.mint(&setup.contract_id, &500); // rate = 1.5e9

    // 1000 amount -> 1000 * 1e9 / 1.5e9 = 666 shares
    assert_eq!(setup.client.preview_deposit(&1000), 666);
    // 1000 shares -> 1000 * 1.5e9 / 1e9 = 1500 amount
    assert_eq!(setup.client.preview_withdraw(&1000), 1500);
}
