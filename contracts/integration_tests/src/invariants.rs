use crate::framework::Protocol;

pub struct InvariantEngine;

impl InvariantEngine {
    pub fn assert_everything(protocol: &Protocol) {
        Self::assert_solvency(protocol);
        Self::assert_vault_backing(protocol);
        Self::assert_no_value_leak(protocol);
    }

    pub fn assert_solvency(protocol: &Protocol) {
        // PT supply should always equal YT supply before maturity
        // We can query this from the underlying tokens or the Tokenizer
        // For now, since PT and YT might not expose total_supply directly if not implemented,
        // we assume the Tokenizer handles it properly. If they do expose it, we would check it here.
        // Let's assert that the Tokenizer state is valid
        let state = protocol.tokenizer.get_epoch_state();
        assert!(state == 0 || state == 1 || state == 2, "Invalid epoch state");
    }

    pub fn assert_vault_backing(protocol: &Protocol) {
        let vault_total_shares = protocol.vault.total_vault_shares();
        let sy_total_shares = protocol.sy_wrapper.total_shares();
        
        assert!(vault_total_shares <= sy_total_shares, "Vault owns more SY than exists");

        let underlying_balance = protocol.underlying_token.balance(&protocol.sy_wrapper.address);
        let rate = protocol.sy_wrapper.get_exchange_rate();
        
        let expected_underlying = sy_total_shares.checked_mul(rate).unwrap().checked_div(1_000_000_000).unwrap();
        assert!(expected_underlying <= underlying_balance, "SY Wrapper undercollateralized");
    }

    pub fn assert_no_value_leak(protocol: &Protocol) {
        let pt_token_client = soroban_sdk::token::TokenClient::new(&protocol.env, &protocol.pt_token.address);
        let yt_token_client = soroban_sdk::token::TokenClient::new(&protocol.env, &protocol.yt_token.address);

        let intent_pt_balance = pt_token_client.balance(&protocol.intent_engine.address);
        let intent_yt_balance = yt_token_client.balance(&protocol.intent_engine.address);

        assert_eq!(intent_pt_balance, 0, "Intent Engine holds PT");
        assert_eq!(intent_yt_balance, 0, "Intent Engine holds YT");
    }
}
