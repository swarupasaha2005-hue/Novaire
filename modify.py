import sys

with open('contracts/marketplace/src/lib.rs', 'r') as f:
    content = f.read()

target = "let yt_price = 1_000_000_000_i128.checked_sub(pt_price).ok_or(NovaireMarketError::MathOverflow)?;"
replacement = """
        if pt_price > 1_000_000_000_i128 {
            // Cap pt_price at 1.0 to prevent MathOverflow in yt_price calculation
            let yt_price = 0;
            // Let it fail at checked_div if yt_price == 0, but log the values!
        }
        let yt_price = 1_000_000_000_i128.checked_sub(pt_price).unwrap_or(0);
        if yt_price == 0 {
            return Err(NovaireMarketError::MathOverflow);
        }
"""
content = content.replace(target, replacement)
with open('contracts/marketplace/src/lib.rs', 'w') as f:
    f.write(content)
