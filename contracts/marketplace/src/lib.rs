#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NovaireMarketError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    EpochExpired = 4,
    InsufficientLiquidity = 5,
    SlippageExceeded = 6,
    ZeroInput = 7,
    BelowMinimumLiquidity = 8,
    StorageMissing = 9,
    InvariantViolated = 10,
    MathOverflow = 11,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    PtToken,
    YtToken,
    Underlying,
    SyWrapper,
    Tokenizer,
    MaturityLedger,
    CreatedLedger,
    PtReserves,
    UnderlyingReserves,
    YtReserves,
    TotalLpShares,
    ImpliedRateTwap,
    LastTwapLedger,
    LpBalance(Address),
}

#[soroban_sdk::contractclient(name = "SyWrapperClient")]
pub trait SyWrapperInterface {
    fn get_exchange_rate(env: Env) -> i128;
}

mod storage {
    use super::*;

    pub fn is_initialized(env: &Env) -> bool {
        env.storage().instance().has(&DataKey::Admin)
    }

    pub fn get_address(env: &Env, key: DataKey) -> Result<Address, NovaireMarketError> {
        env.storage().instance().get(&key).ok_or(NovaireMarketError::StorageMissing)
    }

    pub fn get_u32(env: &Env, key: DataKey) -> Result<u32, NovaireMarketError> {
        env.storage().instance().get(&key).ok_or(NovaireMarketError::StorageMissing)
    }

    pub fn get_i128(env: &Env, key: DataKey) -> Result<i128, NovaireMarketError> {
        env.storage().instance().get(&key).ok_or(NovaireMarketError::StorageMissing)
    }
    
    pub fn get_lp_balance(env: &Env, provider: &Address) -> i128 {
        env.storage().persistent().get(&DataKey::LpBalance(provider.clone())).unwrap_or(0)
    }

    pub fn set_lp_balance(env: &Env, provider: &Address, balance: i128) {
        env.storage().persistent().set(&DataKey::LpBalance(provider.clone()), &balance);
    }

    pub fn set_i128(env: &Env, key: DataKey, val: i128) {
        env.storage().instance().set(&key, &val);
    }
}

fn integer_sqrt(val: i128) -> i128 {
    if val <= 0 { return 0; }
    let mut z = (val + 1) / 2;
    let mut y = val;
    while z < y {
        y = z;
        z = (val / z + z) / 2;
    }
    y
}

fn compute_a_pool(env: &Env, x: i128, y: i128) -> Result<i128, NovaireMarketError> {
    let maturity = storage::get_u32(env, DataKey::MaturityLedger)?;
    let created = storage::get_u32(env, DataKey::CreatedLedger)?;
    let current = env.ledger().sequence();

    if current >= maturity {
        // Return a very large number simulating infinity for 1:1 constant sum
        return x.checked_add(y).ok_or(NovaireMarketError::MathOverflow)?
            .checked_mul(1_000_000_000).ok_or(NovaireMarketError::MathOverflow);
    }

    let t_rem = (maturity.checked_sub(current).ok_or(NovaireMarketError::MathOverflow)?) as i128;
    let t_tot = (maturity.checked_sub(created).ok_or(NovaireMarketError::MathOverflow)?) as i128;
    
    if t_rem <= 0 {
        return Ok(1_000_000_000_000_000);
    }

    // base_A = ((t_tot - t_rem) * 1_000_000) / t_rem;
    let elapsed = t_tot.checked_sub(t_rem).ok_or(NovaireMarketError::MathOverflow)?;
    let base_a = elapsed.checked_mul(1_000_000).ok_or(NovaireMarketError::MathOverflow)?
        .checked_div(t_rem).ok_or(NovaireMarketError::MathOverflow)?;

    let sum = x.checked_add(y).ok_or(NovaireMarketError::MathOverflow)?;
    let avg = sum.checked_div(2).ok_or(NovaireMarketError::MathOverflow)?;

    let a_pool = base_a.checked_mul(avg).ok_or(NovaireMarketError::MathOverflow)?
        .checked_div(1_000_000).ok_or(NovaireMarketError::MathOverflow)?;

    Ok(a_pool)
}

fn compute_k(a_pool: i128, x: i128, y: i128) -> Result<i128, NovaireMarketError> {
    // k = A_pool * (x + y) + x * y
    let sum = x.checked_add(y).ok_or(NovaireMarketError::MathOverflow)?;
    let part1 = a_pool.checked_mul(sum).ok_or(NovaireMarketError::MathOverflow)?;
    let part2 = x.checked_mul(y).ok_or(NovaireMarketError::MathOverflow)?;
    part1.checked_add(part2).ok_or(NovaireMarketError::MathOverflow)
}

fn get_y(a_pool: i128, k: i128, x_new: i128) -> Result<i128, NovaireMarketError> {
    // y_new = (k - A_pool * x_new) / (A_pool + x_new)
    let ax = a_pool.checked_mul(x_new).ok_or(NovaireMarketError::MathOverflow)?;
    if k < ax {
        return Ok(0); // Depleted
    }
    let num = k.checked_sub(ax).ok_or(NovaireMarketError::MathOverflow)?;
    let den = a_pool.checked_add(x_new).ok_or(NovaireMarketError::MathOverflow)?;
    num.checked_div(den).ok_or(NovaireMarketError::MathOverflow)
}

fn get_spot_price(a_pool: i128, x: i128, y: i128) -> Result<i128, NovaireMarketError> {
    // P = (A_pool + y) / (A_pool + x) scaled to 1e9
    let num = a_pool.checked_add(y).ok_or(NovaireMarketError::MathOverflow)?;
    let den = a_pool.checked_add(x).ok_or(NovaireMarketError::MathOverflow)?;
    if den == 0 { return Ok(1_000_000_000); }
    num.checked_mul(1_000_000_000).ok_or(NovaireMarketError::MathOverflow)?
        .checked_div(den).ok_or(NovaireMarketError::MathOverflow)
}

#[contract]
pub struct NovaireMarketplace;

#[contractimpl]
impl NovaireMarketplace {
    pub fn initialize(
        env: Env,
        admin: Address,
        pt_token: Address,
        yt_token: Address,
        underlying: Address,
        sy_wrapper: Address,
        tokenizer: Address,
        maturity_ledger: u32,
    ) -> Result<(), NovaireMarketError> {
        if storage::is_initialized(&env) {
            return Err(NovaireMarketError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PtToken, &pt_token);
        env.storage().instance().set(&DataKey::YtToken, &yt_token);
        env.storage().instance().set(&DataKey::Underlying, &underlying);
        env.storage().instance().set(&DataKey::SyWrapper, &sy_wrapper);
        env.storage().instance().set(&DataKey::Tokenizer, &tokenizer);
        env.storage().instance().set(&DataKey::MaturityLedger, &maturity_ledger);
        env.storage().instance().set(&DataKey::CreatedLedger, &env.ledger().sequence());
        
        storage::set_i128(&env, DataKey::PtReserves, 0);
        storage::set_i128(&env, DataKey::UnderlyingReserves, 0);
        storage::set_i128(&env, DataKey::YtReserves, 0);
        storage::set_i128(&env, DataKey::TotalLpShares, 0);
        storage::set_i128(&env, DataKey::ImpliedRateTwap, 0);

        Ok(())
    }

    pub fn add_liquidity(
        env: Env,
        provider: Address,
        pt_amount: i128,
        underlying_amount: i128,
    ) -> Result<i128, NovaireMarketError> {
        provider.require_auth();
        if pt_amount <= 0 || underlying_amount <= 0 {
            return Err(NovaireMarketError::ZeroInput);
        }

        let pt_token_addr = storage::get_address(&env, DataKey::PtToken)?;
        let underlying_addr = storage::get_address(&env, DataKey::Underlying)?;
        
        let pt_client = token::Client::new(&env, &pt_token_addr);
        let underlying_client = token::Client::new(&env, &underlying_addr);

        pt_client.transfer(&provider, &env.current_contract_address(), &pt_amount);
        underlying_client.transfer(&provider, &env.current_contract_address(), &underlying_amount);

        let mut pt_reserves = storage::get_i128(&env, DataKey::PtReserves)?;
        let mut underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;
        let mut total_lp_shares = storage::get_i128(&env, DataKey::TotalLpShares)?;

        let lp_shares;
        if total_lp_shares == 0 {
            lp_shares = integer_sqrt(pt_amount.checked_mul(underlying_amount).ok_or(NovaireMarketError::MathOverflow)?);
        } else {
            let pt_ratio = pt_amount.checked_mul(total_lp_shares).ok_or(NovaireMarketError::MathOverflow)?
                .checked_div(pt_reserves).ok_or(NovaireMarketError::MathOverflow)?;
            let underlying_ratio = underlying_amount.checked_mul(total_lp_shares).ok_or(NovaireMarketError::MathOverflow)?
                .checked_div(underlying_reserves).ok_or(NovaireMarketError::MathOverflow)?;
            lp_shares = pt_ratio.min(underlying_ratio);
        }

        pt_reserves = pt_reserves.checked_add(pt_amount).ok_or(NovaireMarketError::MathOverflow)?;
        underlying_reserves = underlying_reserves.checked_add(underlying_amount).ok_or(NovaireMarketError::MathOverflow)?;
        total_lp_shares = total_lp_shares.checked_add(lp_shares).ok_or(NovaireMarketError::MathOverflow)?;

        storage::set_i128(&env, DataKey::PtReserves, pt_reserves);
        storage::set_i128(&env, DataKey::UnderlyingReserves, underlying_reserves);
        storage::set_i128(&env, DataKey::TotalLpShares, total_lp_shares);

        let current_lp = storage::get_lp_balance(&env, &provider);
        storage::set_lp_balance(&env, &provider, current_lp.checked_add(lp_shares).ok_or(NovaireMarketError::MathOverflow)?);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "add_liquidity"), provider),
            (pt_amount, underlying_amount, lp_shares),
        );

        Self::assert_invariant(&env)?;
        Ok(lp_shares)
    }

    pub fn remove_liquidity(
        env: Env,
        provider: Address,
        lp_shares: i128,
    ) -> Result<(i128, i128), NovaireMarketError> {
        provider.require_auth();
        if lp_shares <= 0 {
            return Err(NovaireMarketError::ZeroInput);
        }

        let current_lp = storage::get_lp_balance(&env, &provider);
        if current_lp < lp_shares {
            return Err(NovaireMarketError::InsufficientLiquidity);
        }

        let mut pt_reserves = storage::get_i128(&env, DataKey::PtReserves)?;
        let mut underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;
        let mut total_lp_shares = storage::get_i128(&env, DataKey::TotalLpShares)?;

        let pt_out = lp_shares.checked_mul(pt_reserves).ok_or(NovaireMarketError::MathOverflow)?
            .checked_div(total_lp_shares).ok_or(NovaireMarketError::MathOverflow)?;
        let underlying_out = lp_shares.checked_mul(underlying_reserves).ok_or(NovaireMarketError::MathOverflow)?
            .checked_div(total_lp_shares).ok_or(NovaireMarketError::MathOverflow)?;

        if pt_reserves.checked_sub(pt_out).unwrap_or(0) < 1000 || underlying_reserves.checked_sub(underlying_out).unwrap_or(0) < 1000 {
            if total_lp_shares > lp_shares {
                return Err(NovaireMarketError::BelowMinimumLiquidity);
            }
        }

        pt_reserves = pt_reserves.checked_sub(pt_out).ok_or(NovaireMarketError::MathOverflow)?;
        underlying_reserves = underlying_reserves.checked_sub(underlying_out).ok_or(NovaireMarketError::MathOverflow)?;
        total_lp_shares = total_lp_shares.checked_sub(lp_shares).ok_or(NovaireMarketError::MathOverflow)?;

        storage::set_lp_balance(&env, &provider, current_lp.checked_sub(lp_shares).unwrap());
        storage::set_i128(&env, DataKey::PtReserves, pt_reserves);
        storage::set_i128(&env, DataKey::UnderlyingReserves, underlying_reserves);
        storage::set_i128(&env, DataKey::TotalLpShares, total_lp_shares);

        let pt_token_addr = storage::get_address(&env, DataKey::PtToken)?;
        let underlying_addr = storage::get_address(&env, DataKey::Underlying)?;
        
        let pt_client = token::Client::new(&env, &pt_token_addr);
        let underlying_client = token::Client::new(&env, &underlying_addr);

        pt_client.transfer(&env.current_contract_address(), &provider, &pt_out);
        underlying_client.transfer(&env.current_contract_address(), &provider, &underlying_out);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "remove_liquidity"), provider),
            (lp_shares, pt_out, underlying_out),
        );

        Self::assert_invariant(&env)?;
        Ok((pt_out, underlying_out))
    }

    pub fn swap_underlying_for_pt(
        env: Env,
        buyer: Address,
        underlying_in: i128,
        min_pt_out: i128,
    ) -> Result<i128, NovaireMarketError> {
        buyer.require_auth();
        if underlying_in <= 0 || min_pt_out <= 0 {
            return Err(NovaireMarketError::ZeroInput);
        }

        let maturity = storage::get_u32(&env, DataKey::MaturityLedger)?;
        if env.ledger().sequence() >= maturity {
            return Err(NovaireMarketError::EpochExpired);
        }

        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves)?;
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;

        let a_pool = compute_a_pool(&env, underlying_reserves, pt_reserves)?;
        let k = compute_k(a_pool, underlying_reserves, pt_reserves)?;

        let underlying_in_after_fee = underlying_in.checked_mul(997).unwrap().checked_div(1000).unwrap();
        let new_underlying = underlying_reserves.checked_add(underlying_in_after_fee).unwrap();

        let new_pt = get_y(a_pool, k, new_underlying)?;
        let pt_out = pt_reserves.checked_sub(new_pt).unwrap_or(0);

        if pt_out < min_pt_out {
            return Err(NovaireMarketError::SlippageExceeded);
        }

        if pt_reserves.checked_sub(pt_out).unwrap_or(0) < 1000 {
            return Err(NovaireMarketError::BelowMinimumLiquidity);
        }

        storage::set_i128(&env, DataKey::PtReserves, pt_reserves.checked_sub(pt_out).unwrap());
        storage::set_i128(&env, DataKey::UnderlyingReserves, underlying_reserves.checked_add(underlying_in).unwrap());

        // Update TWAP
        let current_spot = get_spot_price(a_pool, new_underlying, new_pt)?;
        let old_twap = storage::get_i128(&env, DataKey::ImpliedRateTwap).unwrap_or(0);
        let new_twap = if old_twap == 0 { current_spot } else { (old_twap * 9 + current_spot) / 10 };
        storage::set_i128(&env, DataKey::ImpliedRateTwap, new_twap);

        let pt_token_addr = storage::get_address(&env, DataKey::PtToken)?;
        let underlying_addr = storage::get_address(&env, DataKey::Underlying)?;
        
        let pt_client = token::Client::new(&env, &pt_token_addr);
        let underlying_client = token::Client::new(&env, &underlying_addr);

        underlying_client.transfer(&buyer, &env.current_contract_address(), &underlying_in);
        pt_client.transfer(&env.current_contract_address(), &buyer, &pt_out);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "swap_u_pt"), buyer),
            (underlying_in, pt_out),
        );

        Self::assert_invariant(&env)?;
        Ok(pt_out)
    }

    pub fn swap_pt_for_underlying(
        env: Env,
        seller: Address,
        pt_in: i128,
        min_underlying_out: i128,
    ) -> Result<i128, NovaireMarketError> {
        seller.require_auth();
        if pt_in <= 0 || min_underlying_out <= 0 {
            return Err(NovaireMarketError::ZeroInput);
        }

        let maturity = storage::get_u32(&env, DataKey::MaturityLedger)?;
        if env.ledger().sequence() >= maturity {
            return Err(NovaireMarketError::EpochExpired);
        }

        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves)?;
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;

        let a_pool = compute_a_pool(&env, pt_reserves, underlying_reserves)?;
        let k = compute_k(a_pool, pt_reserves, underlying_reserves)?;

        let pt_in_after_fee = pt_in.checked_mul(997).unwrap().checked_div(1000).unwrap();
        let new_pt = pt_reserves.checked_add(pt_in_after_fee).unwrap();

        let new_underlying = get_y(a_pool, k, new_pt)?;
        let underlying_out = underlying_reserves.checked_sub(new_underlying).unwrap_or(0);

        if underlying_out < min_underlying_out {
            return Err(NovaireMarketError::SlippageExceeded);
        }

        if underlying_reserves.checked_sub(underlying_out).unwrap_or(0) < 1000 {
            return Err(NovaireMarketError::BelowMinimumLiquidity);
        }

        storage::set_i128(&env, DataKey::PtReserves, pt_reserves.checked_add(pt_in).unwrap());
        storage::set_i128(&env, DataKey::UnderlyingReserves, underlying_reserves.checked_sub(underlying_out).unwrap());

        let current_spot = get_spot_price(a_pool, new_pt, new_underlying)?;
        let old_twap = storage::get_i128(&env, DataKey::ImpliedRateTwap).unwrap_or(0);
        let new_twap = if old_twap == 0 { current_spot } else { (old_twap * 9 + current_spot) / 10 };
        storage::set_i128(&env, DataKey::ImpliedRateTwap, new_twap);

        let pt_token_addr = storage::get_address(&env, DataKey::PtToken)?;
        let underlying_addr = storage::get_address(&env, DataKey::Underlying)?;
        
        let pt_client = token::Client::new(&env, &pt_token_addr);
        let underlying_client = token::Client::new(&env, &underlying_addr);

        pt_client.transfer(&seller, &env.current_contract_address(), &pt_in);
        underlying_client.transfer(&env.current_contract_address(), &seller, &underlying_out);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "swap_pt_u"), seller),
            (pt_in, underlying_out),
        );

        Self::assert_invariant(&env)?;
        Ok(underlying_out)
    }

    pub fn swap_underlying_for_yt(
        env: Env,
        buyer: Address,
        underlying_in: i128,
        min_yt_out: i128,
    ) -> Result<i128, NovaireMarketError> {
        buyer.require_auth();
        if underlying_in <= 0 || min_yt_out <= 0 {
            return Err(NovaireMarketError::ZeroInput);
        }

        let maturity = storage::get_u32(&env, DataKey::MaturityLedger)?;
        if env.ledger().sequence() >= maturity {
            return Err(NovaireMarketError::EpochExpired);
        }

        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves)?;
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;

        let a_pool = compute_a_pool(&env, pt_reserves, underlying_reserves)?;
        let pt_price = get_spot_price(a_pool, underlying_reserves, pt_reserves)?;
        
        let yt_price = 1_000_000_000i128.checked_sub(pt_price).unwrap_or(0);
        if yt_price <= 0 {
            return Err(NovaireMarketError::InsufficientLiquidity);
        }

        let yt_out = underlying_in.checked_mul(1_000_000_000).unwrap().checked_div(yt_price).unwrap();
        let actual_yt_out = yt_out.checked_mul(995).unwrap().checked_div(1000).unwrap();

        if actual_yt_out < min_yt_out {
            return Err(NovaireMarketError::SlippageExceeded);
        }

        let mut yt_reserves = storage::get_i128(&env, DataKey::YtReserves)?;
        if yt_reserves < actual_yt_out {
            return Err(NovaireMarketError::InsufficientLiquidity);
        }

        yt_reserves = yt_reserves.checked_sub(actual_yt_out).unwrap();
        storage::set_i128(&env, DataKey::YtReserves, yt_reserves);

        let yt_token_addr = storage::get_address(&env, DataKey::YtToken)?;
        let underlying_addr = storage::get_address(&env, DataKey::Underlying)?;
        
        let yt_client = token::Client::new(&env, &yt_token_addr);
        let underlying_client = token::Client::new(&env, &underlying_addr);

        underlying_client.transfer(&buyer, &env.current_contract_address(), &underlying_in);
        yt_client.transfer(&env.current_contract_address(), &buyer, &actual_yt_out);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "swap_u_yt"), buyer),
            (underlying_in, actual_yt_out),
        );

        Self::assert_invariant(&env)?;
        Ok(actual_yt_out)
    }

    pub fn swap_yt_for_underlying(
        env: Env,
        seller: Address,
        yt_in: i128,
        min_underlying_out: i128,
    ) -> Result<i128, NovaireMarketError> {
        seller.require_auth();
        if yt_in <= 0 || min_underlying_out <= 0 {
            return Err(NovaireMarketError::ZeroInput);
        }

        let maturity = storage::get_u32(&env, DataKey::MaturityLedger)?;
        if env.ledger().sequence() >= maturity {
            return Err(NovaireMarketError::EpochExpired);
        }

        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves)?;
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;

        let a_pool = compute_a_pool(&env, pt_reserves, underlying_reserves)?;
        let pt_price = get_spot_price(a_pool, underlying_reserves, pt_reserves)?;
        
        let yt_price = 1_000_000_000i128.checked_sub(pt_price).unwrap_or(0);
        
        let underlying_out = yt_in.checked_mul(yt_price).unwrap().checked_div(1_000_000_000).unwrap();
        let actual_underlying_out = underlying_out.checked_mul(995).unwrap().checked_div(1000).unwrap();

        if actual_underlying_out < min_underlying_out {
            return Err(NovaireMarketError::SlippageExceeded);
        }

        let mut yt_reserves = storage::get_i128(&env, DataKey::YtReserves)?;
        yt_reserves = yt_reserves.checked_add(yt_in).unwrap();
        storage::set_i128(&env, DataKey::YtReserves, yt_reserves);

        let yt_token_addr = storage::get_address(&env, DataKey::YtToken)?;
        let underlying_addr = storage::get_address(&env, DataKey::Underlying)?;
        
        let yt_client = token::Client::new(&env, &yt_token_addr);
        let underlying_client = token::Client::new(&env, &underlying_addr);

        yt_client.transfer(&seller, &env.current_contract_address(), &yt_in);
        underlying_client.transfer(&env.current_contract_address(), &seller, &actual_underlying_out);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "swap_yt_u"), seller),
            (yt_in, actual_underlying_out),
        );

        Self::assert_invariant(&env)?;
        Ok(actual_underlying_out)
    }

    pub fn get_pt_price(env: Env) -> Result<i128, NovaireMarketError> {
        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves).unwrap_or(0);
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves).unwrap_or(0);
        let a_pool = compute_a_pool(&env, underlying_reserves, pt_reserves)?;
        get_spot_price(a_pool, underlying_reserves, pt_reserves)
    }

    pub fn get_twap_rate(env: Env) -> Result<i128, NovaireMarketError> {
        Ok(storage::get_i128(&env, DataKey::ImpliedRateTwap).unwrap_or(0))
    }

    pub fn get_reserves(env: Env) -> Result<(i128, i128, i128), NovaireMarketError> {
        let pt = storage::get_i128(&env, DataKey::PtReserves).unwrap_or(0);
        let under = storage::get_i128(&env, DataKey::UnderlyingReserves).unwrap_or(0);
        let yt = storage::get_i128(&env, DataKey::YtReserves).unwrap_or(0);
        Ok((pt, under, yt))
    }

    fn assert_invariant(env: &Env) -> Result<(), NovaireMarketError> {
        let pt = storage::get_i128(env, DataKey::PtReserves)?;
        let under = storage::get_i128(env, DataKey::UnderlyingReserves)?;
        let total_lp = storage::get_i128(env, DataKey::TotalLpShares)?;
        
        if (pt == 0 && under > 0) || (under == 0 && pt > 0) {
            return Err(NovaireMarketError::InvariantViolated);
        }
        if total_lp == 0 && (pt > 0 || under > 0) {
            return Err(NovaireMarketError::InvariantViolated);
        }
        
        let pt_token_addr = storage::get_address(env, DataKey::PtToken)?;
        let underlying_addr = storage::get_address(env, DataKey::Underlying)?;
        let pt_client = token::Client::new(env, &pt_token_addr);
        let underlying_client = token::Client::new(env, &underlying_addr);
        
        let contract_addr = env.current_contract_address();
        let actual_pt = pt_client.balance(&contract_addr);
        let actual_underlying = underlying_client.balance(&contract_addr);

        if actual_pt < pt || actual_underlying < under {
            return Err(NovaireMarketError::InvariantViolated);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};

    use sy_wrapper::{SyWrapper, SyWrapperClient as RealSyWrapperClient};
    use pt_token::{PtToken, PtTokenClient as RealPtClient};
    use yt_token::{YtToken, YtTokenClient as RealYtClient};
    use vault::{Vault, VaultClient as RealVaultClient};

    fn setup_env() -> (Env, Address, Address, Address, NovaireMarketplaceClient<'static>, RealSyWrapperClient<'static>, token::StellarAssetClient<'static>) {
        let env = Env::default();
        env.mock_all_auths_allowing_non_root_auth();

        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
        let underlying_token = token_contract.address();
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract.address());

        let sy_contract_id = env.register(SyWrapper, ());
        let sy_client = RealSyWrapperClient::new(&env, &sy_contract_id);
        
        let vault_contract_id = env.register(Vault, ());
        let vault_client = RealVaultClient::new(&env, &vault_contract_id);
        
        sy_client.initialize(&admin, &underlying_token, &vault_contract_id, &1_000_000_000);
        vault_client.initialize(&admin, &sy_contract_id, &underlying_token);

        let pt_contract_id = env.register(PtToken, ());
        let pt_client = RealPtClient::new(&env, &pt_contract_id);
        pt_client.initialize(&admin, &Address::generate(&env));

        let yt_contract_id = env.register(YtToken, ());
        let yt_client = RealYtClient::new(&env, &yt_contract_id);
        yt_client.initialize(&admin, &Address::generate(&env), &1_000);

        let market_contract_id = env.register(NovaireMarketplace, ());
        let market_client = NovaireMarketplaceClient::new(&env, &market_contract_id);

        let maturity_ledger = 1_000;
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 10, // created at 10
            ..env.ledger().get()
        });

        market_client.initialize(
            &admin,
            &pt_contract_id,
            &yt_contract_id,
            &underlying_token,
            &sy_contract_id,
            &Address::generate(&env),
            &maturity_ledger,
        );

        (env, admin, underlying_token, pt_contract_id, market_client, sy_client, token_admin_client)
    }

    #[test]
    fn test_1_initialize_and_add_liquidity() {
        let (env, _, _, pt_token, market_client, _, token_admin_client) = setup_env();
        let provider = Address::generate(&env);

        let pt_client = pt_token::PtTokenClient::new(&env, &pt_token);
        
        token_admin_client.mint(&provider, &1_000_000);
        pt_client.mint(&provider, &1_000_000);

        let lp_shares = market_client.add_liquidity(&provider, &100_000, &100_000);
        assert_eq!(lp_shares, 100_000);
        
        let (pt, under, _) = market_client.get_reserves();
        assert_eq!(pt, 100_000);
        assert_eq!(under, 100_000);
    }

    #[test]
    fn test_2_swap_u_for_pt_at_half_maturity() {
        let (env, _, underlying_token, pt_token, market_client, _, token_admin_client) = setup_env();
        let provider = Address::generate(&env);
        let pt_client = pt_token::PtTokenClient::new(&env, &pt_token);
        let underlying_client = token::Client::new(&env, &underlying_token);

        token_admin_client.mint(&provider, &10_000_000_000);
        pt_client.mint(&provider, &10_000_000_000);
        market_client.add_liquidity(&provider, &10_000_000, &10_000_000); 

        // Advance to half maturity (created at 10, maturity 1000, current 505)
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 505,
            ..env.ledger().get()
        });

        let buyer = Address::generate(&env);
        token_admin_client.mint(&buyer, &1_000_000);

        let pt_price = market_client.get_pt_price();
        assert!(pt_price > 0 && pt_price <= 1_000_000_000);

        let pt_out = market_client.swap_underlying_for_pt(&buyer, &1_000_000, &1);
        assert!(pt_out > 0);

        assert_eq!(pt_client.balance(&buyer), pt_out);
        assert_eq!(underlying_client.balance(&buyer), 0);
    }

    #[test]
    fn test_3_swap_u_for_pt_near_maturity() {
        let (env, _, _, pt_token, market_client, _, token_admin_client) = setup_env();
        let provider = Address::generate(&env);
        let pt_client = pt_token::PtTokenClient::new(&env, &pt_token);

        token_admin_client.mint(&provider, &10_000_000_000);
        pt_client.mint(&provider, &10_000_000_000);
        market_client.add_liquidity(&provider, &10_000_000, &10_000_000);

        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            sequence_number: 990,
            ..env.ledger().get()
        });

        let pt_price = market_client.get_pt_price();
        assert!(pt_price > 900_000_000); 
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #6)")]
    fn test_4_slippage_protection() {
        let (env, _, _, pt_token, market_client, _, token_admin_client) = setup_env();
        let provider = Address::generate(&env);
        let pt_client = pt_token::PtTokenClient::new(&env, &pt_token);

        token_admin_client.mint(&provider, &10_000_000_000);
        pt_client.mint(&provider, &10_000_000_000);
        market_client.add_liquidity(&provider, &10_000_000, &10_000_000);

        let buyer = Address::generate(&env);
        token_admin_client.mint(&buyer, &1_000_000);

        market_client.swap_underlying_for_pt(&buyer, &1_000_000, &2_000_000_000); // Impossible
    }
}
