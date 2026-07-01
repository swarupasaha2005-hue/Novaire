use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};

use pt_token::PtTokenClient;
use yt_token::YtTokenClient;
use tokenizer::TokenizerClient;
use vault::VaultClient;
use sy_wrapper::SyWrapperClient;
use marketplace::NovaireMarketplaceClient;
use intent_engine::IntentEngineClient;
use rollover::AutonomousRolloverClient;
use maturity_engine::MaturityEngineClient;

pub struct Protocol<'a> {
    pub env: Env,
    pub admin: Address,
    pub underlying_token: token::TokenClient<'a>,
    pub underlying_admin: token::StellarAssetClient<'a>,
    pub vault: VaultClient<'a>,
    pub sy_wrapper: SyWrapperClient<'a>,
    pub tokenizer: TokenizerClient<'a>,
    pub pt_token: PtTokenClient<'a>,
    pub yt_token: YtTokenClient<'a>,
    pub marketplace: NovaireMarketplaceClient<'a>,
    pub intent_engine: IntentEngineClient<'a>,
    pub rollover: AutonomousRolloverClient<'a>,
    pub maturity_engine: MaturityEngineClient<'a>,
    pub keeper: Address,
}

impl<'a> Protocol<'a> {
    pub fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths_allowing_non_root_auth();

        let admin = Address::generate(&env);
        let keeper = Address::generate(&env);

        let underlying_token_admin = Address::generate(&env);
        let underlying_token_addr = env.register_stellar_asset_contract_v2(underlying_token_admin.clone()).address();
        let underlying_token = token::TokenClient::new(&env, &underlying_token_addr);
        let underlying_admin = token::StellarAssetClient::new(&env, &underlying_token_addr);

        let vault_addr = env.register(vault::Vault, ());
        let vault = VaultClient::new(&env, &vault_addr);

        let sy_wrapper_addr = env.register(sy_wrapper::SyWrapper, ());
        let sy_wrapper = SyWrapperClient::new(&env, &sy_wrapper_addr);

        let pt_token_addr = env.register(pt_token::PtToken, ());
        let pt_token = PtTokenClient::new(&env, &pt_token_addr);

        let yt_token_addr = env.register(yt_token::YtToken, ());
        let yt_token = YtTokenClient::new(&env, &yt_token_addr);

        let tokenizer_addr = env.register(tokenizer::Tokenizer, ());
        let tokenizer = TokenizerClient::new(&env, &tokenizer_addr);

        let marketplace_addr = env.register(marketplace::NovaireMarketplace, ());
        let marketplace = NovaireMarketplaceClient::new(&env, &marketplace_addr);

        let intent_engine_addr = env.register(intent_engine::IntentEngine, ());
        let intent_engine = IntentEngineClient::new(&env, &intent_engine_addr);

        let rollover_addr = env.register(rollover::AutonomousRollover, ());
        let rollover = AutonomousRolloverClient::new(&env, &rollover_addr);

        let maturity_engine_addr = env.register(maturity_engine::MaturityEngine, ());
        let maturity_engine = MaturityEngineClient::new(&env, &maturity_engine_addr);

        // INITIALIZE ALL
        sy_wrapper.initialize(&admin, &underlying_token_addr, &vault_addr);
        vault.initialize(&admin, &sy_wrapper_addr, &underlying_token_addr);
        pt_token.initialize(&admin, &tokenizer_addr);
        
        let maturity_ledger: u32 = 100000;
        yt_token.initialize(&admin, &tokenizer_addr, &maturity_ledger);
        tokenizer.initialize(&admin, &vault_addr, &pt_token_addr, &yt_token_addr, &sy_wrapper_addr, &maturity_ledger);
        marketplace.initialize(&admin, &pt_token_addr, &yt_token_addr, &underlying_token_addr, &sy_wrapper_addr, &tokenizer_addr, &maturity_ledger);
        intent_engine.initialize(&admin, &vault_addr, &tokenizer_addr, &marketplace_addr, &sy_wrapper_addr, &underlying_token_addr, &pt_token_addr, &yt_token_addr);
        rollover.initialize(&admin, &tokenizer_addr, &vault_addr, &marketplace_addr, &intent_engine_addr, &keeper, &pt_token_addr, &underlying_token_addr, &17280);
        maturity_engine.initialize(&admin);

        Protocol {
            env,
            admin,
            underlying_token,
            underlying_admin,
            vault,
            sy_wrapper,
            tokenizer,
            pt_token,
            yt_token,
            marketplace,
            intent_engine,
            rollover,
            maturity_engine,
            keeper,
        }
    }

    pub fn create_user(&self) -> Address {
        Address::generate(&self.env)
    }

    pub fn mint_mock_usdc(&self, user: &Address, amount: i128) {
        self.underlying_admin.mint(user, &amount);
    }

    pub fn deposit(&self, user: &Address, amount: i128) -> i128 {
        self.vault.deposit(user, &amount)
    }

    pub fn try_deposit(&self, user: &Address, amount: i128) {
        let _ = self.vault.try_deposit(user, &amount);
    }

    pub fn withdraw(&self, user: &Address, amount: i128) -> i128 {
        self.vault.withdraw(user, &amount)
    }

    pub fn try_withdraw(&self, user: &Address, amount: i128) {
        let _ = self.vault.try_withdraw(user, &amount);
    }

    pub fn mint_pt_yt(&self, user: &Address, amount: i128) -> (i128, i128) {
        self.tokenizer.mint_pt_yt(user, &amount)
    }

    pub fn try_mint_pt_yt(&self, user: &Address, amount: i128) {
        let _ = self.tokenizer.try_mint_pt_yt(user, &amount);
    }
}
