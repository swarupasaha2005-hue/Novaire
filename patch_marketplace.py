import sys

with open("contracts/marketplace/src/lib.rs", "r") as f:
    content = f.read()

# 1. compute_a_pool signature
content = content.replace(
    "fn compute_a_pool(env: &Env, x: i128, y: i128) -> Result<i128, NovaireMarketError> {\n    let maturity = storage::get_u32(env, DataKey::MaturityLedger)?;",
    "fn compute_a_pool(env: &Env, maturity: u32, x: i128, y: i128) -> Result<i128, NovaireMarketError> {"
)

# 2. swap_underlying_for_pt call
content = content.replace(
    "let a_pool = compute_a_pool(&env, underlying_reserves, pt_reserves)?;",
    "let a_pool = compute_a_pool(&env, maturity, underlying_reserves, pt_reserves)?;"
)

# 3. swap_pt_for_underlying call
content = content.replace(
    "let a_pool = compute_a_pool(&env, pt_reserves, underlying_reserves)?;",
    "let a_pool = compute_a_pool(&env, maturity, pt_reserves, underlying_reserves)?;"
)

# 4. swap_underlying_for_yt PT Price inline
content = content.replace(
    """        let pt_price = Self::get_pt_price(env.clone())?;
        let yt_price = 1_000_000_000_i128.checked_sub(pt_price).unwrap_or(0);""",
    """        let a_pool = compute_a_pool(&env, maturity, pt_reserves, underlying_reserves)?;
        let pt_price = get_spot_price(a_pool, pt_reserves, underlying_reserves)?;
        let yt_price = 1_000_000_000_i128.checked_sub(pt_price).unwrap_or(0);"""
)

# 5. swap_yt_for_underlying PT Price inline
content = content.replace(
    """        let pt_price = Self::get_pt_price(env.clone())?;
        
        let capped_pt_price = if pt_price > 1_000_000_000_i128 {""",
    """        let a_pool = compute_a_pool(&env, maturity, pt_reserves, underlying_reserves)?;
        let pt_price = get_spot_price(a_pool, pt_reserves, underlying_reserves)?;
        
        let capped_pt_price = if pt_price > 1_000_000_000_i128 {"""
)

# 6. swap_yt_for_underlying UnderlyingReserves read optimization
content = content.replace(
    """        let mut current_underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves)?;
        current_underlying_reserves = current_underlying_reserves.checked_sub(actual_underlying_out).ok_or(NovaireMarketError::MathOverflow)?;
        storage::set_i128(&env, DataKey::UnderlyingReserves, current_underlying_reserves);""",
    """        let new_underlying_reserves = underlying_reserves.checked_sub(actual_underlying_out).ok_or(NovaireMarketError::MathOverflow)?;
        storage::set_i128(&env, DataKey::UnderlyingReserves, new_underlying_reserves);"""
)

# 7. get_pt_price update
content = content.replace(
    """    pub fn get_pt_price(env: Env) -> Result<i128, NovaireMarketError> {
        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves).unwrap_or(0);
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves).unwrap_or(0);
        let a_pool = compute_a_pool(&env, maturity, underlying_reserves, pt_reserves)?;""",
    """    pub fn get_pt_price(env: Env) -> Result<i128, NovaireMarketError> {
        let pt_reserves = storage::get_i128(&env, DataKey::PtReserves).unwrap_or(0);
        let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves).unwrap_or(0);
        let maturity = storage::get_u32(&env, DataKey::MaturityLedger)?;
        let a_pool = compute_a_pool(&env, maturity, underlying_reserves, pt_reserves)?;"""
)

# 8. get_twap_rate update
content = content.replace(
    """            let pt_reserves = storage::get_i128(&env, DataKey::PtReserves).unwrap_or(0);
            let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves).unwrap_or(0);
            let a_pool = compute_a_pool(&env, maturity, pt_reserves, underlying_reserves)?;""",
    """            let pt_reserves = storage::get_i128(&env, DataKey::PtReserves).unwrap_or(0);
            let underlying_reserves = storage::get_i128(&env, DataKey::UnderlyingReserves).unwrap_or(0);
            let maturity = storage::get_u32(&env, DataKey::MaturityLedger)?;
            let a_pool = compute_a_pool(&env, maturity, pt_reserves, underlying_reserves)?;"""
)

# 9. assert_invariant optimization
content = content.replace(
    """        if actual_pt < pt || actual_underlying < under {
        if actual_pt < pt {
            return Err(NovaireMarketError::InsufficientLiquidity); // 2
        }
        if actual_underlying < under {
            return Err(NovaireMarketError::ZeroInput); // 3
        }
        }""",
    """        if actual_pt < pt {
            return Err(NovaireMarketError::InsufficientLiquidity); // 2
        }
        if actual_underlying < under {
            return Err(NovaireMarketError::ZeroInput); // 3
        }"""
)

with open("contracts/marketplace/src/lib.rs", "w") as f:
    f.write(content)
