//! End-to-End Lifecycle Scenarios — realistic user journeys across contracts.

use crate::framework::{Protocol, SCALE, MATURITY_LEDGER};
use crate::invariants::InvariantEngine;

// ── Scenario 1: Simple deposit ────────────────────────────────────────────────
#[test]
fn scenario_simple_deposit() {
    let protocol = Protocol::new();
    let user = protocol.create_user();
    protocol.mint_mock_usdc(&user, 100_000);
    protocol.deposit(&user, 50_000);
    InvariantEngine::assert_everything(&protocol);
}

// ── Scenario 2: Mint PT/YT ────────────────────────────────────────────────────
#[test]
fn scenario_mint_pt_yt() {
    let protocol = Protocol::new();
    let user = protocol.create_user();
    protocol.mint_mock_usdc(&user, 100_000);
    protocol.deposit(&user, 50_000);
    protocol.mint_pt_yt(&user, 30_000);
    InvariantEngine::assert_everything(&protocol);
}

// ── Scenario 3: Full lifecycle — deposit → mint → trade → redeem ──────────────
#[test]
fn scenario_full_lifecycle() {
    let protocol = Protocol::new();

    // Bootstrap marketplace
    let lp = protocol.create_user();
    protocol.bootstrap_marketplace(&lp);
    protocol.advance_ledger(1);

    // User A: long PT (fixed yield)
    let user_a = protocol.create_user();
    protocol.mint_mock_usdc(&user_a, 500_000_000);
    protocol.deposit(&user_a, 300_000_000);
    protocol.mint_pt_yt(&user_a, 200_000_000);
    InvariantEngine::assert_everything(&protocol);

    // User A swaps some underlying for more PT
    protocol.mint_mock_usdc(&user_a, 10_000_000);
    protocol.try_swap_u_for_pt(&user_a, 10_000_000);
    InvariantEngine::assert_everything(&protocol);

    // User B: yield speculation
    let user_b = protocol.create_user();
    protocol.mint_mock_usdc(&user_b, 100_000_000);
    protocol.execute_yield_speculation_intent(&user_b, 50_000_000, 1);
    InvariantEngine::assert_everything(&protocol);

    // Advance 20% through epoch
    protocol.advance_ledger(MATURITY_LEDGER / 5);

    // Claim yield
    protocol.try_claim_yield(&user_a);
    InvariantEngine::assert_everything(&protocol);

    // Advance to maturity
    protocol.set_ledger(MATURITY_LEDGER + 1);
    protocol.settle_epoch();

    // Redeem PT
    let pt_bal = protocol.pt_token.balance(&user_a);
    if pt_bal > 0 {
        let redeemed = protocol.redeem_pt(&user_a, pt_bal);
        assert!(redeemed > 0, "Full lifecycle: PT redemption must return underlying");
    }

    InvariantEngine::assert_everything(&protocol);
    println!("  ✅ Full lifecycle scenario complete");
}

// ── Scenario 4: Rollover registration and custody check ───────────────────────
#[test]
fn scenario_rollover_custody() {
    let protocol = Protocol::new();

    // Setup: user mints PT then registers rollover
    let user = protocol.create_user();
    protocol.mint_mock_usdc(&user, 50_000_000);
    protocol.deposit(&user, 50_000_000);
    protocol.mint_pt_yt(&user, 30_000_000);

    let pt_bal = protocol.pt_token.balance(&user);
    assert!(pt_bal > 0, "Rollover scenario: user must have PT");

    // Register rollover
    let rollover_amt = pt_bal / 2;
    protocol.register_rollover(&user, rollover_amt, 100);

    // INV-9: Rollover contract PT custody
    let actual_pt  = protocol.pt_token.balance(&protocol.rollover.address);
    assert!(actual_pt > 0,
        "Rollover custody: actual PT must be > 0");

    InvariantEngine::assert_everything(&protocol);

    // Exit rollover
    protocol.exit_rollover(&user);
    let actual_pt_after  = protocol.pt_token.balance(&protocol.rollover.address);
    assert_eq!(actual_pt_after, 0,
        "Post-exit custody mismatch: actual={actual_pt_after}");

    InvariantEngine::assert_everything(&protocol);
    println!("  ✅ Rollover custody scenario complete");
}

// ── Scenario 5: PT converges toward face value near maturity ──────────────────
#[test]
fn scenario_pt_converges_near_maturity() {
    let protocol = Protocol::new();
    let lp = protocol.create_user();
    protocol.bootstrap_marketplace(&lp);

    // At 10% of epoch (early)
    protocol.advance_ledger(MATURITY_LEDGER / 10);
    let spot_early = protocol.get_pt_price();

    // At 90% of epoch (near maturity)
    protocol.set_ledger(MATURITY_LEDGER - MATURITY_LEDGER / 10);
    let spot_late = protocol.get_pt_price();

    // Near-maturity price must be closer to SCALE than early price
    let dist_early = (SCALE - spot_early).abs();
    let dist_late  = (SCALE - spot_late).abs();
    assert!(
        dist_late <= dist_early,
        "PT convergence: early dist={dist_early}, late dist={dist_late} — not converging!"
    );
    assert!(spot_late > 0 && spot_late <= SCALE);
    println!("  ✅ PT converges toward face value: early={spot_early}, late={spot_late}");
}

// ── Scenario 6: Multi-user PT==YT conservation throughout operations ──────────
#[test]
fn scenario_pt_yt_conservation_multi_user() {
    let protocol = Protocol::new();
    let users: Vec<_> = (0..5).map(|_| {
        let u = protocol.create_user();
        protocol.mint_mock_usdc(&u, 50_000_000);
        protocol.deposit(&u, 40_000_000);
        u
    }).collect();

    // Each user mints a different amount
    for (i, u) in users.iter().enumerate() {
        let mint_amt = 5_000_000 + i as i128 * 1_000_000;
        protocol.mint_pt_yt(u, mint_amt);
        // Immediately verify PT==YT
        let state = protocol.tokenizer.get_epoch_state();
        if state == 1 {
            let pt_supply = protocol.pt_token.total_supply();
            let yt_supply = protocol.yt_token.total_supply();
            assert_eq!(pt_supply, yt_supply,
                "PT/YT mismatch after user {i} mint: pt={pt_supply}, yt={yt_supply}");
        }
    }
    InvariantEngine::assert_everything(&protocol);
    println!("  ✅ PT==YT conservation holds for all 5 users");
}

// ── Scenario 7: Intent Engine zero-balance guarantee ─────────────────────────
#[test]
fn scenario_intent_engine_zero_balance() {
    let protocol = Protocol::new();
    let lp = protocol.create_user();
    protocol.bootstrap_marketplace(&lp);
    protocol.advance_ledger(1);

    let user = protocol.create_user();
    protocol.mint_mock_usdc(&user, 200_000_000);

    // Fixed yield intent
    protocol.execute_fixed_yield_intent(&user, 50_000_000, 1, 100);
    // Check IE has zero balance
    let pt_held  = protocol.pt_token.balance(&protocol.intent_engine.address);
    let yt_held  = protocol.yt_token.balance(&protocol.intent_engine.address);
    let und_held = protocol.underlying_token.balance(&protocol.intent_engine.address);
    assert_eq!(pt_held,  0, "IE holds PT={pt_held} after fixed yield intent");
    assert_eq!(yt_held,  0, "IE holds YT={yt_held} after fixed yield intent");
    assert_eq!(und_held, 0, "IE holds underlying={und_held} after fixed yield intent");

    // Yield speculation intent
    protocol.execute_yield_speculation_intent(&user, 50_000_000, 1);
    let pt_held2  = protocol.pt_token.balance(&protocol.intent_engine.address);
    let yt_held2  = protocol.yt_token.balance(&protocol.intent_engine.address);
    let und_held2 = protocol.underlying_token.balance(&protocol.intent_engine.address);
    assert_eq!(pt_held2,  0, "IE holds PT={pt_held2} after speculation intent");
    assert_eq!(yt_held2,  0, "IE holds YT={yt_held2} after speculation intent");
    assert_eq!(und_held2, 0, "IE holds underlying={und_held2} after speculation intent");

    InvariantEngine::assert_everything(&protocol);
    println!("  ✅ Intent Engine zero-balance guarantee holds for both intent types");
}
