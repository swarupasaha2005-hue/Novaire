import { Keypair, Networks, rpc } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;

const DEPLOYMENTS_FILE = path.resolve(__dirname, 'deployments.testnet.json');
const TESTNET_KEYS = path.resolve(__dirname, 'testnet_keys.json');

async function fundAccount(publicKey: string) {
    console.log(`Funding wallet ${publicKey} via Friendbot...`);
    try {
        await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`);
    } catch (e: any) {
        if (e.response && e.response.status === 400) {
            console.log("Account already funded.");
        } else {
            console.warn("Friendbot failed, assuming account has funds.");
        }
    }
}

function invoke(contractId: string, fn: string, args: string, secret: string) {
    try {
        const cmd = `stellar contract invoke --id ${contractId} --source ${secret} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}" -- ${fn} ${args}`;
        return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
    } catch (e: any) {
        console.error(`Failed to invoke ${fn} on ${contractId}:`, e?.stderr?.toString() || e);
        throw e;
    }
}

function parseSorobanI128(val: string): bigint {
    // Soroban CLI returns strings like "1000000000" or maybe quotes
    return BigInt(val.replace(/['"]/g, ''));
}

async function run() {
    console.log('--- Step 1: Loading Artifacts ---');
    if (!fs.existsSync(DEPLOYMENTS_FILE)) throw new Error('Deployments missing.');
    const d = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, 'utf-8'));
    console.log("Contracts Loaded:");
    console.log(`Underlying: ${d.underlying_token}`);
    console.log(`Vault: ${d.vault}`);
    console.log(`Tokenizer: ${d.tokenizer}`);
    console.log(`Marketplace: ${d.marketplace}`);
    console.log(`Intent Engine: ${d.intent_engine}`);
    console.log(`PT Token: ${d.pt_token}`);
    console.log(`YT Token: ${d.yt_token}`);

    console.log('\n--- Step 2: Treasury Setup ---');
    if (!fs.existsSync(TESTNET_KEYS)) throw new Error('testnet_keys.json missing');
    const keys = JSON.parse(fs.readFileSync(TESTNET_KEYS, 'utf-8'));
    const adminKp = Keypair.fromSecret(keys.admin_secret);
    const adminAddress = adminKp.publicKey();
    console.log(`Treasury Wallet: ${adminAddress}`);

    await fundAccount(adminAddress);

    const initXlm = parseSorobanI128(invoke(d.underlying_token, 'balance', `--id ${adminAddress}`, adminKp.secret()));
    console.log(`Treasury Initial XLM Balance (stroops): ${initXlm.toString()}`);
    if (initXlm < BigInt(1000000000)) {
        throw new Error('Treasury lacks sufficient XLM to bootstrap (need at least 100 XLM).');
    }

    // Step 3 (Cleanup): Remove any existing liquidity from previous failed runs.
    // get_lp_balance is a private fn — read TotalLpShares via the reserves query workaround.
    // Since treasury is sole LP, query reserves[2] (total_lp) to get our balance.
    // Actually get_reserves returns (pt, underlying, yt) not lp shares. Use SDK remove_liquidity
    // with a large number and catch the "insufficient shares" error if clean, or use the binding.
    const { Client: MarketplaceClient } = await import('../packages/bindings/marketplace/src/index');
    const marketplaceClient = new MarketplaceClient({
        networkPassphrase: NETWORK_PASSPHRASE,
        rpcUrl: RPC_URL,
        contractId: d.marketplace
    });

    console.log('Querying existing LP shares via Stellar ledger...');
    // Read LP balance: try removing 1 share to simulate and get the "insufficient" error, 
    // or read ledger entry directly. Simplest: encode the DataKey::LpBalance storage key.
    // We use stellar-sdk to read the storage entry directly.
    const { SorobanRpc: _unused, rpc: rpcModule, xdr, Address, nativeToScVal } = await import('@stellar/stellar-sdk');
    const rpcClient = new rpcModule.Server(RPC_URL, { allowHttp: true });
    
    // Encode the LpBalance(admin) key
    const lpKey = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('LpBalance'),
            val: xdr.ScVal.scvVec([Address.fromString(adminAddress).toScVal()])
        })
    ]);
    
    let currentLpBalance = BigInt(0);
    try {
        const contractId = d.marketplace;
        const ledgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contract: Address.fromString(contractId).toScAddress(),
                key: lpKey,
                durability: xdr.ContractDataDurability.persistent()
            })
        );
        const entries = await rpcClient.getLedgerEntries(ledgerKey);
        if (entries.entries.length > 0) {
            const val = entries.entries[0].val.contractData().val();
            currentLpBalance = BigInt(val.i128().hi().toNumber() * 2**64 + val.i128().lo().toNumber());
        }
    } catch(e) {
        console.log('Could not read LP balance from ledger, assuming 0.');
    }
    console.log(`Treasury LP Balance: ${currentLpBalance.toString()}`);

    if (currentLpBalance > BigInt(0)) {
        console.log(`Removing existing skewed liquidity (${currentLpBalance.toString()} LP shares)...`);
        const removeTx = await marketplaceClient.remove_liquidity({
            provider: adminAddress,
            lp_shares: currentLpBalance
        });
        await removeTx.signAndSend({
            signTransaction: async (xdrStr: string) => {
                const { TransactionBuilder } = await import('@stellar/stellar-sdk');
                const tx = TransactionBuilder.fromXDR(xdrStr, NETWORK_PASSPHRASE);
                tx.sign(adminKp);
                return tx.toXDR();
            }
        });
        console.log('Existing liquidity removed. Pool is now clean.');
    } else {
        console.log('No existing liquidity to remove.');
    }

    // Step 3a: Mint fresh PT/YT to provide as liquidity.
    const DEPOSIT_AMOUNT = "1000000000"; // 100 XLM
    console.log(`3a. Vault.deposit(${DEPOSIT_AMOUNT})...`);
    invoke(d.vault, 'deposit', `--depositor ${adminAddress} --amount ${DEPOSIT_AMOUNT}`, adminKp.secret());
    
    console.log(`3b. Tokenizer.mint_pt_yt(${DEPOSIT_AMOUNT})...`);
    invoke(d.tokenizer, 'mint_pt_yt', `--user ${adminAddress} --sy_shares ${DEPOSIT_AMOUNT}`, adminKp.secret());

    // PT must be discounted vs Underlying so pt_price < 1.0 and yt_price > 0.
    // Ratio: 95 PT : 100 Underlying => pt_price ≈ 0.95, yt_price ≈ 0.05 (5% implied yield).
    const PT_AMOUNT = "950000000";
    const UNDERLYING_AMOUNT = "1000000000"; 
    console.log(`3c. Marketplace.add_liquidity(PT: ${PT_AMOUNT}, Underlying: ${UNDERLYING_AMOUNT})...`);
    invoke(d.marketplace, 'add_liquidity', `--provider ${adminAddress} --pt_amount ${PT_AMOUNT} --underlying_amount ${UNDERLYING_AMOUNT}`, adminKp.secret());

    // Step 3.5: Warm-up swap to initialize the TWAP.
    // The TWAP is only updated on swap operations, NOT on add_liquidity.
    // We must execute at least one swap to seed a non-zero TWAP before the
    // IntentEngine can route retail transactions.
    const WARMUP_AMOUNT = "1000000"; // 0.1 XLM warm-up
    console.log(`3.5. Warm-up swap (swap_underlying_for_pt: ${WARMUP_AMOUNT} stroops) to initialize TWAP...`);
    // Note: min_pt_out must be > 0 per Marketplace ZeroInput check. Use 1 stroop.
    invoke(d.marketplace, 'swap_underlying_for_pt', `--buyer ${adminAddress} --underlying_in ${WARMUP_AMOUNT} --min_pt_out 1`, adminKp.secret());

    console.log('\n--- Step 4: Verification ---');
    const twapRaw = invoke(d.marketplace, 'get_twap_rate', '', adminKp.secret());
    console.log(`Marketplace TWAP Rate: ${twapRaw}`);

    const ptReserveRaw = invoke(d.pt_token, 'balance', `--id ${d.marketplace}`, adminKp.secret());
    const undReserveRaw = invoke(d.underlying_token, 'balance', `--id ${d.marketplace}`, adminKp.secret());
    console.log(`Marketplace PT Reserve: ${ptReserveRaw}`);
    console.log(`Marketplace Underlying Reserve: ${undReserveRaw}`);

    const twapValue = parseSorobanI128(twapRaw.replace(/^Ok\((.+)\)$/, '$1'));
    if (twapValue <= BigInt(0)) {
        throw new Error('BLOCKER: TWAP is still 0 after warm-up swap. The Marketplace swap logic may not be initializing ImpliedRateTwap correctly. Aborting.');
    }
    console.log(`✅ TWAP seeded successfully: ${twapValue.toString()}`);


    // Compute maturity ledger for the retail intent
    const rpcServer = new rpc.Server(RPC_URL, { allowHttp: true });
    const latestLedger = await rpcServer.getLatestLedger();
    const currentMaturityLedger = latestLedger.sequence + 50000;

    console.log('\n--- Step 5: Intent Engine Execution ---');
    const testWallet = Keypair.random();
    console.log(`Retail Test Wallet: ${testWallet.publicKey()}`);
    await fundAccount(testWallet.publicKey());

    // Wait a moment for Friendbot to settle
    await new Promise(r => setTimeout(r, 3000));

    const retailDeposit = "10000000"; // 1 XLM

    console.log('Invoking execute_fixed_yield_intent via CLI...');
    try {
        const mintResult = invoke(
            d.intent_engine,
            'execute_fixed_yield_intent',
            `--user ${testWallet.publicKey()} --usdc_amount ${retailDeposit} --min_implied_rate 0 --_maturity_ledger ${currentMaturityLedger}`,
            testWallet.secret()
        );
        console.log('Retail Transaction Success!');
        console.log('Mint Result:', mintResult);
    } catch (e: any) {
        const stderr = e.stderr?.toString() || e.message || String(e);
        console.error('Retail Transaction Failed:', stderr);
        throw new Error('Retail mint transaction failed!');
    }

    console.log('\n--- Step 6: Final Verification ---');
    const retailPt = invoke(d.pt_token, 'balance', `--id ${testWallet.publicKey()}`, testWallet.secret());
    const retailYt = invoke(d.yt_token, 'balance', `--id ${testWallet.publicKey()}`, testWallet.secret());
    const retailXlm = invoke(d.underlying_token, 'balance', `--id ${testWallet.publicKey()}`, testWallet.secret());

    console.log(`Retail PT Balance: ${retailPt}`);
    console.log(`Retail YT Balance: ${retailYt}`);
    console.log(`Retail XLM Balance: ${retailXlm} (minus gas)`);

    console.log('\n✅ Bootstrap and Execution Completed Successfully!');
}

run().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});
