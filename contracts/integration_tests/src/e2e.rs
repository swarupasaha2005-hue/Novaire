use crate::framework::Protocol;
use crate::invariants::InvariantEngine;

#[test]
fn scenario_simple_deposit() {
    let protocol = Protocol::new();
    let user = protocol.create_user();

    protocol.mint_mock_usdc(&user, 100_000);
    protocol.deposit(&user, 50_000);

    InvariantEngine::assert_everything(&protocol);
}

#[test]
fn scenario_mint_pt_yt() {
    let protocol = Protocol::new();
    let user = protocol.create_user();

    protocol.mint_mock_usdc(&user, 100_000);
    protocol.deposit(&user, 50_000);
    protocol.mint_pt_yt(&user, 50_000);

    InvariantEngine::assert_everything(&protocol);
}
