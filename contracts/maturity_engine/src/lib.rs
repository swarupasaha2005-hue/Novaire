#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireMaturityError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    EpochNotFound = 4,
    EpochNotActive = 5,
    EpochNotSettled = 6,
    EpochAlreadySettled = 7,
    EpochAlreadyActive = 8,
    MaturityNotReached = 9,
    ZeroAmount = 10,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EpochState {
    Active = 0,
    Matured = 1,
    Settled = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EpochRecord {
    pub epoch_id: u32,
    pub maturity_ledger: u32,
    pub creation_ledger: u32,
    pub total_pt_outstanding: i128,
    pub final_exchange_rate: i128,
    pub total_yield_distributed: i128,
    pub state: EpochState,
}

#[soroban_sdk::contractclient(name = "SyWrapperClient")]
pub trait SyWrapperInterface {
    fn get_exchange_rate(env: Env) -> i128;
}

#[soroban_sdk::contractclient(name = "PtTokenClient")]
pub trait PtTokenInterface {
    fn total_supply(env: Env) -> i128;
}

#[soroban_sdk::contractclient(name = "YtTokenClient")]
pub trait YtTokenInterface {
    fn claimable_yield(env: Env, user: Address) -> i128;
}

#[contract]
pub struct MaturityEngine;

#[contractimpl]
impl MaturityEngine {
    pub fn initialize(
        env: Env,
        admin: Address,
        vault: Address,
        sy_wrapper: Address,
        pt_token: Address,
        yt_token: Address,
    ) -> Result<(), NovaireMaturityError> {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            return Err(NovaireMaturityError::AlreadyInitialized);
        }
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "vault"), &vault);
        env.storage().instance().set(&Symbol::new(&env, "sy_wrapper"), &sy_wrapper);
        env.storage().instance().set(&Symbol::new(&env, "pt_token"), &pt_token);
        env.storage().instance().set(&Symbol::new(&env, "yt_token"), &yt_token);
        env.storage().instance().set(&Symbol::new(&env, "current_epoch_id"), &0u32);
        Ok(())
    }

    pub fn open_epoch(env: Env, maturity_ledger: u32) -> Result<u32, NovaireMaturityError> {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).ok_or(NovaireMaturityError::NotInitialized)?;
        admin.require_auth();

        if maturity_ledger <= env.ledger().sequence() {
            return Err(NovaireMaturityError::MaturityNotReached); // using as a generic "invalid maturity"
        }

        let current_epoch_id: u32 = env.storage().instance().get(&Symbol::new(&env, "current_epoch_id")).unwrap();
        
        if current_epoch_id > 0 {
            let current_epoch = Self::get_epoch(env.clone(), current_epoch_id)?;
            if current_epoch.state == EpochState::Active {
                return Err(NovaireMaturityError::EpochAlreadyActive);
            }
        }

        let new_epoch_id = current_epoch_id + 1;
        env.storage().instance().set(&Symbol::new(&env, "current_epoch_id"), &new_epoch_id);

        let new_epoch = EpochRecord {
            epoch_id: new_epoch_id,
            maturity_ledger,
            creation_ledger: env.ledger().sequence(),
            total_pt_outstanding: 0,
            final_exchange_rate: 0,
            total_yield_distributed: 0,
            state: EpochState::Active,
        };

        env.storage().persistent().set(&new_epoch_id, &new_epoch);
        env.events().publish((Symbol::new(&env, "epoch_opened"),), (new_epoch_id, maturity_ledger));

        Ok(new_epoch_id)
    }

    pub fn settle_epoch(env: Env, epoch_id: u32) -> Result<(), NovaireMaturityError> {
        let mut epoch = Self::get_epoch(env.clone(), epoch_id)?;

        if epoch.state == EpochState::Settled {
            return Err(NovaireMaturityError::EpochAlreadySettled);
        }

        if env.ledger().sequence() < epoch.maturity_ledger {
            return Err(NovaireMaturityError::MaturityNotReached);
        }

        let sy_wrapper_addr: Address = env.storage().instance().get(&Symbol::new(&env, "sy_wrapper")).unwrap();
        let sy_client = SyWrapperClient::new(&env, &sy_wrapper_addr);
        let final_exchange_rate = sy_client.get_exchange_rate();

        let pt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "pt_token")).unwrap();
        let pt_client = PtTokenClient::new(&env, &pt_token_addr);
        let total_pt_outstanding = pt_client.total_supply();

        epoch.final_exchange_rate = final_exchange_rate;
        epoch.total_pt_outstanding = total_pt_outstanding;
        epoch.state = EpochState::Settled;

        env.storage().persistent().set(&epoch_id, &epoch);
        env.events().publish((Symbol::new(&env, "epoch_settled"),), (epoch_id, final_exchange_rate, total_pt_outstanding));

        Ok(())
    }

    pub fn authorize_pt_redemption(env: Env, user: Address, epoch_id: u32, pt_amount: i128) -> Result<i128, NovaireMaturityError> {
        let epoch = Self::get_epoch(env.clone(), epoch_id)?;
        if epoch.state != EpochState::Settled {
            return Err(NovaireMaturityError::EpochNotSettled);
        }
        if pt_amount <= 0 {
            return Err(NovaireMaturityError::ZeroAmount);
        }

        let underlying_owed = (pt_amount.checked_mul(epoch.final_exchange_rate).unwrap()) / 1_000_000_000;
        env.events().publish((Symbol::new(&env, "pt_redemption_authorized"), user), (pt_amount, underlying_owed));

        Ok(underlying_owed)
    }

    pub fn authorize_yt_yield_claim(env: Env, user: Address, epoch_id: u32) -> Result<i128, NovaireMaturityError> {
        let epoch = Self::get_epoch(env.clone(), epoch_id)?;
        if epoch.state == EpochState::Settled {
            return Err(NovaireMaturityError::EpochAlreadySettled);
        }

        let yt_token_addr: Address = env.storage().instance().get(&Symbol::new(&env, "yt_token")).unwrap();
        let yt_client = YtTokenClient::new(&env, &yt_token_addr);
        
        let claimable = yt_client.claimable_yield(&user);
        if claimable <= 0 {
            return Err(NovaireMaturityError::ZeroAmount);
        }

        env.events().publish((Symbol::new(&env, "yt_yield_authorized"), user), claimable);
        Ok(claimable)
    }

    pub fn get_epoch(env: Env, epoch_id: u32) -> Result<EpochRecord, NovaireMaturityError> {
        env.storage().persistent().get(&epoch_id).ok_or(NovaireMaturityError::EpochNotFound)
    }

    pub fn get_current_epoch(env: Env) -> Result<EpochRecord, NovaireMaturityError> {
        let current_epoch_id: u32 = env.storage().instance().get(&Symbol::new(&env, "current_epoch_id")).unwrap_or(0);
        if current_epoch_id == 0 {
            return Err(NovaireMaturityError::EpochNotFound);
        }
        Self::get_epoch(env, current_epoch_id)
    }

    pub fn is_active(env: Env) -> bool {
        if let Ok(epoch) = Self::get_current_epoch(env.clone()) {
            epoch.state == EpochState::Active && env.ledger().sequence() < epoch.maturity_ledger
        } else {
            false
        }
    }

    pub fn is_settled(env: Env) -> bool {
        if let Ok(epoch) = Self::get_current_epoch(env.clone()) {
            epoch.state == EpochState::Settled
        } else {
            false
        }
    }

    pub fn time_to_maturity(env: Env) -> u32 {
        if let Ok(epoch) = Self::get_current_epoch(env.clone()) {
            if epoch.state == EpochState::Active {
                return epoch.maturity_ledger.saturating_sub(env.ledger().sequence());
            }
        }
        0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};

    // We only need a mock setup for SyWrapper, PtToken, YtToken. 
    // Wait, the prompt says to use the real contracts! 
    use sy_wrapper::{SyWrapper, SyWrapperClient as RealSyWrapperClient};
    use pt_token::{PtToken, PtTokenClient as RealPtClient};
    use yt_token::{YtToken, YtTokenClient as RealYtClient};

    fn setup_env() -> (Env, Address, Address, Address, Address, Address, MaturityEngineClient<'static>, RealSyWrapperClient<'static>, RealYtClient<'static>) {
        let env = Env::default();
        env.mock_all_auths_allowing_non_root_auth();

        let admin = Address::generate(&env);
        let vault = Address::generate(&env); // Mocked for this test
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone()).address();

        let sy_contract_id = env.register(SyWrapper, ());
        let sy_client = RealSyWrapperClient::new(&env, &sy_contract_id);
        sy_client.initialize(&admin, &token_contract, &Address::generate(&env));

        let pt_contract_id = env.register(PtToken, ());
        let pt_client = RealPtClient::new(&env, &pt_contract_id);
        pt_client.initialize(&admin);

        let yt_contract_id = env.register(YtToken, ());
        let yt_client = RealYtClient::new(&env, &yt_contract_id);
        yt_client.initialize(&admin);

        let me_contract_id = env.register(MaturityEngine, ());
        let me_client = MaturityEngineClient::new(&env, &me_contract_id);

        me_client.initialize(
            &admin,
            &vault,
            &sy_contract_id,
            &pt_contract_id,
            &yt_contract_id,
        );

        (env, admin, vault, sy_contract_id, pt_contract_id, yt_contract_id, me_client, sy_client, yt_client)
    }

    #[test]
    fn test_1_open_and_settle() {
        let (env, _admin, _, _, _, _, me_client, _, _) = setup_env();
        
        let start_ledger = 100;
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: start_ledger,
            ..env.ledger().get()
        });

        let maturity = start_ledger + 1000;
        let epoch_id = me_client.open_epoch(&maturity);
        assert_eq!(epoch_id, 1);
        
        assert_eq!(me_client.is_active(), true);
        assert_eq!(me_client.is_settled(), false);

        // Advance ledger
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: maturity + 1,
            ..env.ledger().get()
        });

        me_client.settle_epoch(&epoch_id);

        let epoch = me_client.get_epoch(&epoch_id);
        assert_eq!(epoch.state, EpochState::Settled);
        assert_eq!(me_client.is_active(), false);
        assert_eq!(me_client.is_settled(), true);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #9)")]
    fn test_2_premature_settlement() {
        let (env, _admin, _, _, _, _, me_client, _, _) = setup_env();
        
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });

        let epoch_id = me_client.open_epoch(&10100);
        me_client.settle_epoch(&epoch_id);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #7)")]
    fn test_3_double_settlement() {
        let (env, _admin, _, _, _, _, me_client, _, _) = setup_env();
        
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });

        let epoch_id = me_client.open_epoch(&200);

        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 250,
            ..env.ledger().get()
        });

        me_client.settle_epoch(&epoch_id);
        me_client.settle_epoch(&epoch_id); // double settle
    }

    #[test]
    fn test_4_pt_redemption_math() {
        let (env, _admin, _, _, _, _, me_client, sy_client, _) = setup_env();
        
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });

        let epoch_id = me_client.open_epoch(&200);

        // Exchange rate becomes 1.1x
        sy_client.accrue_yield(&1_100_000_000);

        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 250,
            ..env.ledger().get()
        });

        me_client.settle_epoch(&epoch_id);

        let user = Address::generate(&env);
        let pt_amount = 100_000_000;
        let underlying_owed = me_client.authorize_pt_redemption(&user, &epoch_id, &pt_amount);
        
        assert_eq!(underlying_owed, 110_000_000);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #7)")]
    fn test_5_yt_yield_blocked_post_settlement() {
        let (env, _admin, _, _, _, _, me_client, _, yt_client) = setup_env();
        let user = Address::generate(&env);
        
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });

        let epoch_id = me_client.open_epoch(&200);

        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 250,
            ..env.ledger().get()
        });

        me_client.settle_epoch(&epoch_id);
        
        // YT claim blocked after settlement
        me_client.authorize_yt_yield_claim(&user, &epoch_id);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #8)")]
    fn test_6_double_epoch_prevention() {
        let (env, _admin, _, _, _, _, me_client, _, _) = setup_env();
        
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });

        me_client.open_epoch(&200);
        me_client.open_epoch(&300); // fails
    }

    #[test]
    fn test_7_time_to_maturity() {
        let (env, _admin, _, _, _, _, me_client, _, _) = setup_env();
        
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 100,
            ..env.ledger().get()
        });

        let epoch_id = me_client.open_epoch(&600);
        assert_eq!(me_client.time_to_maturity(), 500);

        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 300,
            ..env.ledger().get()
        });
        assert_eq!(me_client.time_to_maturity(), 300);

        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 700,
            ..env.ledger().get()
        });
        me_client.settle_epoch(&epoch_id);
        assert_eq!(me_client.time_to_maturity(), 0);
    }
}
