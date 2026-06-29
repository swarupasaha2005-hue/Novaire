import { Keypair, Network, rpc, TransactionBuilder, Contract, Asset } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Network.TESTNET;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const KEEPER_SECRET = process.env.KEEPER_SECRET;

async function initialize() {
    if (!ADMIN_SECRET || !KEEPER_SECRET) {
        throw new Error('ADMIN_SECRET and KEEPER_SECRET environment variables are required');
    }

    const adminKp = Keypair.fromSecret(ADMIN_SECRET);
    const keeperKp = Keypair.fromSecret(KEEPER_SECRET);
    const server = new rpc.Server(RPC_URL, { allowHttp: true });

    const deploymentsPath = path.resolve(__dirname, 'deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
        throw new Error('deployments.json not found. Run deploy.ts first.');
    }

    const d = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
    
    // We assume a generic underlying token is already deployed or we use native XLM (for simplicity we use a hardcoded address or deploy one)
    // For testnet, we can use a dummy token or standard USDC. Let's deploy a dummy token.
    console.log('Deploying Mock Underlying Token...');
    const dummyTokenWasm = execSync(`soroban contract install --wasm ../target/wasm32-unknown-unknown/release/pt_token.wasm --source ${adminKp.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`).toString().trim();
    const dummyToken = execSync(`soroban contract deploy --wasm-hash ${dummyTokenWasm} --source ${adminKp.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`).toString().trim();
    console.log(`Dummy Underlying Token deployed at: ${dummyToken}`);

    // Helper to invoke initialize
    const invoke = (contractId: string, fn: string, args: string) => {
        console.log(`Invoking ${fn} on ${contractId}...`);
        try {
            execSync(`soroban contract invoke --id ${contractId} --source ${adminKp.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}" -- ${fn} ${args}`);
        } catch (e: any) {
            console.error(`Failed to invoke ${fn} on ${contractId}:`, e?.stdout?.toString() || e);
            throw e;
        }
    };

    console.log('Initializing SY Wrapper...');
    // pub fn initialize(env: Env, admin: Address, underlying_token: Address, vault: Address, exchange_rate: i128)
    invoke(d.sy_wrapper, 'initialize', `--admin ${adminKp.publicKey()} --underlying_token ${dummyToken} --vault ${d.vault} --exchange_rate 0`);

    console.log('Initializing Vault...');
    // pub fn initialize(env: Env, admin: Address, sy_token: Address, underlying_token: Address)
    invoke(d.vault, 'initialize', `--admin ${adminKp.publicKey()} --sy_token ${d.sy_wrapper} --underlying_token ${dummyToken}`);

    console.log('Initializing PT Token...');
    // pub fn initialize(env: Env, admin: Address, tokenizer: Address)
    invoke(d.pt_token, 'initialize', `--admin ${adminKp.publicKey()} --tokenizer ${d.tokenizer}`);

    console.log('Initializing YT Token...');
    // pub fn initialize(env: Env, admin: Address, tokenizer: Address, maturity_ledger: u32)
    const maturityLedger = 1000000;
    invoke(d.yt_token, 'initialize', `--admin ${adminKp.publicKey()} --tokenizer ${d.tokenizer} --maturity_ledger ${maturityLedger}`);

    console.log('Initializing Tokenizer...');
    // pub fn initialize(env: Env, admin: Address, vault: Address, pt_token: Address, yt_token: Address, sy_token: Address, maturity_ledger: u32)
    invoke(d.tokenizer, 'initialize', `--admin ${adminKp.publicKey()} --vault ${d.vault} --pt_token ${d.pt_token} --yt_token ${d.yt_token} --sy_token ${d.sy_wrapper} --maturity_ledger ${maturityLedger}`);

    console.log('Initializing Marketplace...');
    // pub fn initialize(env: Env, admin: Address, pt_token: Address, yt_token: Address, underlying_token: Address, sy_token: Address, tokenizer: Address, maturity_ledger: u32)
    invoke(d.marketplace, 'initialize', `--admin ${adminKp.publicKey()} --pt_token ${d.pt_token} --yt_token ${d.yt_token} --underlying_token ${dummyToken} --sy_token ${d.sy_wrapper} --tokenizer ${d.tokenizer} --maturity_ledger ${maturityLedger}`);

    console.log('Initializing Intent Engine...');
    // pub fn initialize(env: Env, admin: Address, vault: Address, tokenizer: Address, marketplace: Address, sy_token: Address, underlying_token: Address, pt_token: Address, yt_token: Address)
    invoke(d.intent_engine, 'initialize', `--admin ${adminKp.publicKey()} --vault ${d.vault} --tokenizer ${d.tokenizer} --marketplace ${d.marketplace} --sy_token ${d.sy_wrapper} --underlying_token ${dummyToken} --pt_token ${d.pt_token} --yt_token ${d.yt_token}`);

    console.log('Initializing Rollover Engine...');
    // pub fn initialize(env: Env, admin: Address, tokenizer: Address, vault: Address, marketplace: Address, intent_engine: Address, keeper: Address, pt_token: Address, underlying_token: Address, grace_period_ledgers: u32)
    invoke(d.rollover, 'initialize', `--admin ${adminKp.publicKey()} --tokenizer ${d.tokenizer} --vault ${d.vault} --marketplace ${d.marketplace} --intent_engine ${d.intent_engine} --keeper ${keeperKp.publicKey()} --pt_token ${d.pt_token} --underlying_token ${dummyToken} --grace_period_ledgers 17280`);

    console.log('Initializing Maturity Engine...');
    // pub fn initialize(env: Env, admin: Address, tokenizer: Address, vault: Address)
    invoke(d.maturity_engine, 'initialize', `--admin ${adminKp.publicKey()} --tokenizer ${d.tokenizer} --vault ${d.vault}`);

    console.log('All contracts wired and initialized successfully!');
}

initialize().catch(console.error);
