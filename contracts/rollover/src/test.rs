#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};

use pt_token::{PtToken, PtTokenClient as RealPtClient};
use marketplace::{NovaireMarketplace, NovaireMarketplaceClient as RealMarketplaceClient};
use intent_engine::{IntentEngine, IntentEngineClient as RealIntentEngineClient};

use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct MockIntentEngine;
#[contractimpl]
impl MockIntentEngine {
    pub fn execute_fixed_yield_intent(
        env: Env,
        _user: Address,
        usdc_amount: i128,
        min_implied_rate: i128,
        maturity_ledger: u32,
    ) -> IntentRecord {
        IntentRecord {
            deposited_amount: usdc_amount,
            pt_held: usdc_amount,
            yt_sold: usdc_amount,
            implied_rate_at_entry: min_implied_rate,
            maturity_ledger,
            created_ledger: env.ledger().sequence(),
        }
    }
}

#[contract]
pub struct MockTokenizer;
#[contractimpl]
impl MockTokenizer {
    pub fn redeem_pt(_env: Env, _to: Address, amount: i128) -> i128 {
        amount + 10 // Simulate some yield
    }
}

fn setup_env() -> (Env, Address, Address, AutonomousRolloverClient<'static>, RealPtClient<'static>, token::StellarAssetClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths_allowing_non_root_auth();

    let admin = Address::generate(&env);
    let keeper = Address::generate(&env);
    let token_admin = Address::generate(&env);
    
    let underlying_token = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_admin_client = token::StellarAssetClient::new(&env, &underlying_token);

    let pt_contract_id = env.register(PtToken, ());
    let pt_client = RealPtClient::new(&env, &pt_contract_id);
    pt_client.initialize(&admin);

    let tokenizer_contract_id = env.register(MockTokenizer, ());
    let intent_engine_contract_id = env.register(MockIntentEngine, ());

    let rollover_contract_id = env.register(AutonomousRollover, ());
    let rollover_client = AutonomousRolloverClient::new(&env, &rollover_contract_id);
    rollover_client.initialize(
        &admin,
        &tokenizer_contract_id,
        &Address::generate(&env), // vault
        &Address::generate(&env), // marketplace
        &intent_engine_contract_id,
        &keeper,
        &pt_contract_id,
    );

    env.ledger().set(soroban_sdk::testutils::LedgerInfo {
        sequence_number: 0,
        ..env.ledger().get()
    });

    (env, keeper, underlying_token, rollover_client, pt_client, token_admin_client, intent_engine_contract_id)
}

#[test]
fn test_register_and_execute_rollover() {
    let (env, _, _, rollover, pt_client, token_admin, intent_engine_contract_id) = setup_env();
    
    let user = Address::generate(&env);
    
    // User gets 2000 USDC, wraps it to PT
    token_admin.mint(&user, &2000);

    let intent_client = RealIntentEngineClient::new(&env, &intent_engine_contract_id);

    // Give Intent Engine a valid twap. The market needs liquidity.
    // We already added 1M PT and 1M U liquidity. TWAP is 1.
    intent_client.execute_fixed_yield_intent(&user, &1000, &0, &1000);

    // Mock minting PT to the user since MockIntentEngine doesn't
    pt_client.mint(&user, &1000);

    let initial_pt = pt_client.balance(&user);
    assert!(initial_pt > 0);

    // 1. Register rollover
    rollover.register_rollover(&user, &initial_pt, &1000, &2000, &0);
    
    assert_eq!(pt_client.balance(&user), 0); // Contract took PT

    let position = rollover.get_position(&user);
    assert!(position.active);
    assert_eq!(position.pt_balance, initial_pt);
    assert_eq!(position.next_epoch_maturity, 2000);

    // Advance ledger to maturity
    env.ledger().set(soroban_sdk::testutils::LedgerInfo {
        sequence_number: 1001,
        ..env.ledger().get()
    });

    // 2. Execute rollover
    rollover.execute_rollover(&user);

    let updated_pos = rollover.get_position(&user);
    assert_eq!(updated_pos.current_epoch_maturity, 2000);
    assert_eq!(updated_pos.next_epoch_maturity, 0); // Next epoch reset
    assert!(updated_pos.pt_balance > 0);
}

#[test]
fn test_exit_rollover() {
    let (env, _, _, rollover, pt_client, token_admin, intent_engine_contract_id) = setup_env();
    let user = Address::generate(&env);
    token_admin.mint(&user, &2000);

    let intent_client = RealIntentEngineClient::new(&env, &intent_engine_contract_id);
    intent_client.execute_fixed_yield_intent(&user, &1000, &0, &1000);

    pt_client.mint(&user, &1000);

    let initial_pt = pt_client.balance(&user);
    rollover.register_rollover(&user, &initial_pt, &1000, &2000, &0);

    rollover.exit_rollover(&user);

    assert_eq!(pt_client.balance(&user), initial_pt);
    let pos = rollover.try_get_position(&user);
    assert!(pos.is_err()); // Position deleted
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_next_epoch_not_set() {
    let (env, _, _, rollover, pt_client, token_admin, intent_engine_contract_id) = setup_env();
    let user = Address::generate(&env);
    token_admin.mint(&user, &2000);

    let intent_client = RealIntentEngineClient::new(&env, &intent_engine_contract_id);
    intent_client.execute_fixed_yield_intent(&user, &1000, &0, &1000);

    pt_client.mint(&user, &1000);

    let initial_pt = pt_client.balance(&user);
    rollover.register_rollover(&user, &initial_pt, &1000, &0, &0); // 0 next epoch

    env.ledger().set(soroban_sdk::testutils::LedgerInfo { sequence_number: 1001, ..env.ledger().get() });

    rollover.execute_rollover(&user);
}
