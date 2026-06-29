use crate::framework::Protocol;
use crate::invariants::InvariantEngine;

#[test]
fn stress_test_heavy_load() {
    let protocol = Protocol::new();
    let mut users = vec![];

    // Simulate 100 users
    for _ in 0..100 {
        let u = protocol.create_user();
        protocol.mint_mock_usdc(&u, 1_000_000_000);
        users.push(u);
    }

    // Simulate 1,000 protocol operations in a deterministic stress loop
    for i in 0..1000 {
        let user = &users[i % users.len()];
        let amount = (i as i128 * 100) % 50_000;
        
        if amount > 0 {
            // Mixed operations
            if i % 3 == 0 {
                let _ = protocol.try_deposit(user, amount);
            } else if i % 3 == 1 {
                let _ = protocol.try_mint_pt_yt(user, amount / 2);
            } else {
                let _ = protocol.try_withdraw(user, amount / 10);
            }
        }
        
        // Assert invariants periodically
        if i % 100 == 0 {
            InvariantEngine::assert_everything(&protocol);
        }
    }

    InvariantEngine::assert_everything(&protocol);
}
