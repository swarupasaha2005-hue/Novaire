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
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    assert_eq!(setup.client.get_exchange_rate(), EXCHANGE_RATE_SCALAR);
    assert_eq!(setup.client.total_shares(), 0);
    assert_eq!(setup.client.underlying_asset(), setup.token_contract);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_initialize_fails_twice() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
}

// ==========================================
// 2. Deposit Tests
// ==========================================

#[test]
fn test_normal_deposit() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

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
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    setup.token_admin_client.mint(&setup.user1, &2000);
    setup.client.deposit(&setup.user1, &500);
    setup.client.deposit(&setup.user1, &1500);

    assert_eq!(setup.client.total_shares(), 2000);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 2000);
}

#[test]
fn test_multiple_users_depositing() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.token_admin_client.mint(&setup.user2, &2000);

    setup.client.deposit(&setup.user1, &1000);
    setup.client.deposit(&setup.user2, &2000);

    assert_eq!(setup.client.total_shares(), 3000);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_deposit_zero() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.deposit(&setup.user1, &0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_deposit_negative() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.deposit(&setup.user1, &-100);
}

#[test]
fn test_deposit_after_yield() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    // Yield accrues before any deposits
    setup.client.accrue_yield(&2_000_000_000); // 2.0 exchange rate

    setup.token_admin_client.mint(&setup.user1, &1000);
    let shares = setup.client.deposit(&setup.user1, &1000);
    
    // 1000 * 1e9 / 2e9 = 500 shares
    assert_eq!(shares, 500);
    assert_eq!(setup.client.total_shares(), 500);
}

#[test]
fn test_extremely_large_deposits() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

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
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

    let amount = setup.client.withdraw(&setup.user1, &400);
    assert_eq!(amount, 400);
    assert_eq!(setup.client.total_shares(), 600);
    assert_eq!(setup.token_client.balance(&setup.user1), 400);
    assert_eq!(setup.token_client.balance(&setup.contract_id), 600);
}

#[test]
fn test_withdraw_after_yield() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

    setup.token_admin_client.mint(&setup.contract_id, &500); // simulate yield
    setup.client.accrue_yield(&1_500_000_000);

    let amount = setup.client.withdraw(&setup.user1, &1000);
    assert_eq!(amount, 1500);
    assert_eq!(setup.client.total_shares(), 0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4)")]
fn test_withdraw_zero_shares() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.withdraw(&setup.user1, &0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_withdraw_more_than_exists() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    
    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);
    
    setup.client.withdraw(&setup.user1, &1001);
}

// ==========================================
// 4. Exchange Rate Tests
// ==========================================

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_decreasing_rate_fails() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.accrue_yield(&900_000_000); // lower than 1e9
}

#[test]
fn test_multiple_increases() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.accrue_yield(&1_100_000_000);
    setup.client.accrue_yield(&1_200_000_000);
    assert_eq!(setup.client.get_exchange_rate(), 1_200_000_000);
}

#[test]
fn test_unchanged_rate() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    setup.client.accrue_yield(&1_000_000_000);
    assert_eq!(setup.client.get_exchange_rate(), 1_000_000_000);
}

// ==========================================
// 5. Yield Accrual
// ==========================================

#[test]
fn test_yield_accrual_preserves_total_shares() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    
    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);
    
    let shares_before = setup.client.total_shares();
    setup.client.accrue_yield(&1_500_000_000);
    let shares_after = setup.client.total_shares();
    
    assert_eq!(shares_before, shares_after);
}

// ==========================================
// 6. Preview Functions
// ==========================================

#[test]
fn test_previews() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    
    assert_eq!(setup.client.preview_deposit(&1000), 1000);
    assert_eq!(setup.client.preview_withdraw(&1000), 1000);

    setup.client.accrue_yield(&1_500_000_000);

    // 1000 amount -> 1000 * 1e9 / 1.5e9 = 666 shares
    assert_eq!(setup.client.preview_deposit(&1000), 666);
    // 1000 shares -> 1000 * 1.5e9 / 1e9 = 1500 amount
    assert_eq!(setup.client.preview_withdraw(&1000), 1500);
}

// ==========================================
// 7. Authorization Tests
// ==========================================

#[test]
fn test_unauthorized_yield_accrual() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    
    // We try to call accrue_yield as a non-admin. We will use mock_auths to see if require_auth is triggered on admin
    // By default env.mock_all_auths() allows any auth. Let's specifically check if admin was asked for auth.
    setup.client.accrue_yield(&1_100_000_000);
    
    let auths = setup.env.auths();
    assert!(auths.iter().any(|(addr, _)| *addr == setup.admin));
}

// ==========================================
// 8. Error Handling
// ==========================================

#[test]
#[should_panic(expected = "HostError: Error(Contract, #9)")]
fn test_not_initialized() {
    let setup = setup_test();
    setup.client.deposit(&setup.user1, &1000);
}

// ==========================================
// 9. Multi-user Scenarios
// ==========================================

#[test]
fn test_complex_multi_user_scenario() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    // Alice deposits 1000
    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000); // 1000 shares

    // Bob deposits 2000
    setup.token_admin_client.mint(&setup.user2, &2000);
    setup.client.deposit(&setup.user2, &2000); // 2000 shares

    assert_eq!(setup.client.total_shares(), 3000);

    // Yield accrues, rate to 1.5e9
    setup.token_admin_client.mint(&setup.contract_id, &1500);
    setup.client.accrue_yield(&1_500_000_000);

    // Charlie deposits 3000 at new rate
    setup.token_admin_client.mint(&setup.user3, &3000);
    let charlie_shares = setup.client.deposit(&setup.user3, &3000); // 3000 * 1e9 / 1.5e9 = 2000 shares
    assert_eq!(charlie_shares, 2000);

    assert_eq!(setup.client.total_shares(), 5000);

    // Withdrawals
    assert_eq!(setup.client.withdraw(&setup.user1, &1000), 1500); // Alice withdraws all
    assert_eq!(setup.client.withdraw(&setup.user2, &1000), 1500); // Bob withdraws half
    assert_eq!(setup.client.withdraw(&setup.user3, &2000), 3000); // Charlie withdraws all
    
    assert_eq!(setup.client.total_shares(), 1000); // Bob's remaining shares
}

// ==========================================
// 10. State Invariants
// ==========================================

#[test]
fn test_state_invariants() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    let mut expected_shares = 0;

    for _i in 1..=50 {
        setup.token_admin_client.mint(&setup.user1, &1000);
        let shares = setup.client.deposit(&setup.user1, &1000);
        expected_shares += shares;
        
        assert_eq!(setup.client.total_shares(), expected_shares);
        assert!(setup.client.total_shares() >= 0);
        assert!(setup.client.get_exchange_rate() >= EXCHANGE_RATE_SCALAR);
    }
}

// ==========================================
// 11. Property-Based / Fuzz Style Tests
// ==========================================

#[test]
fn test_randomized_deposits_withdraws() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);
    
    let amounts = [1, 10, 100, 1000, 5555, 99999];
    let rates = [1_000_000_000, 1_100_000_000, 1_500_000_000, 2_000_000_000, 10_000_000_000];

    for amount in amounts {
        setup.token_admin_client.mint(&setup.user1, &amount);
        setup.client.deposit(&setup.user1, &amount);
    }

    for rate in rates {
        setup.client.accrue_yield(&rate);
        assert_eq!(setup.client.get_exchange_rate(), rate);
    }

    // Mint enough yield to the contract to cover the withdrawal
    setup.token_admin_client.mint(&setup.contract_id, &10_000_000_000);

    // Try withdraw all
    let total_shares = setup.client.total_shares();
    let withdrawn = setup.client.withdraw(&setup.user1, &total_shares);
    assert!(withdrawn > 0);
    assert_eq!(setup.client.total_shares(), 0);
}

// ==========================================
// 12. Stress Tests
// ==========================================

#[test]
fn test_stress_deposits() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    setup.token_admin_client.mint(&setup.user1, &100000);
    
    for _ in 0..100 {
        setup.client.deposit(&setup.user1, &100);
    }

    assert_eq!(setup.client.total_shares(), 10000);
}

// ==========================================
// 13. Event Tests
// ==========================================

#[test]
fn test_events() {
    let setup = setup_test();
    setup.client.initialize(&setup.admin, &setup.token_contract, &setup.yield_source, &i128::MAX);

    setup.token_admin_client.mint(&setup.user1, &1000);
    setup.client.deposit(&setup.user1, &1000);

    let events = setup.env.events().all();
    let mut deposit_found = false;
    for (contract_id, topics, data) in events.into_iter() {
        if contract_id == setup.contract_id {
            if topics.len() > 0 {
                let topic: Symbol = topics.get(0).unwrap().into_val(&setup.env);
                if topic == Symbol::new(&setup.env, "sy_deposit") {
                    deposit_found = true;
                    // Additional checks on topics and data can be performed here.
                }
            }
        }
    }
    assert!(deposit_found);
}
