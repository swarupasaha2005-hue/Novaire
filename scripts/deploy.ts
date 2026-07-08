import { Keypair, rpc, Networks, TransactionBuilder, BASE_FEE, Operation, Asset } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

import { saveDeployments } from './utils';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
const DEPLOYMENTS_FILE = path.resolve(__dirname, 'deployments.testnet.json');

let deployments: Record<string, string> = {};
if (fs.existsSync(DEPLOYMENTS_FILE)) {
    deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, 'utf-8'));
}

async function fundAccount(publicKey: string) {
    console.log(`Funding ${publicKey} via Friendbot...`);
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

function runCmd(cmd: string, retries: number = 5): string {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Executing (Attempt ${i + 1}/${retries}): ${cmd}`);
            const result = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
            return result;
        } catch (e: any) {
            const stderr = e.stderr ? e.stderr.toString() : '';
            console.warn(`Command failed on attempt ${i + 1}: ${e.message}\nStderr: ${stderr}`);
            if (i === retries - 1) throw e;
            const sleepTime = Math.pow(2, i) * 2000;
            console.log(`Sleeping for ${sleepTime}ms before retrying...`);
            execSync(`sleep ${sleepTime / 1000}`);
        }
    }
    return '';
}

function runCmdNoFail(cmd: string): string {
    try {
        return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (e: any) {
        return e.stderr ? e.stderr.toString() : e.message;
    }
}

async function deploy() {
    const KEYS_FILE = path.resolve(__dirname, 'testnet_keys.json');
    let admin: Keypair;
    let issuer: Keypair;

    if (fs.existsSync(KEYS_FILE)) {
        const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
        admin = Keypair.fromSecret(keys.admin_secret);
        issuer = Keypair.fromSecret(keys.issuer_secret);
        console.log(`Loaded existing Admin: ${admin.publicKey()}`);
    } else {
        admin = Keypair.random();
        issuer = Keypair.random();
        fs.writeFileSync(KEYS_FILE, JSON.stringify({
            admin_secret: admin.secret(),
            admin_public: admin.publicKey(),
            issuer_secret: issuer.secret(),
            issuer_public: issuer.publicKey()
        }, null, 2));
        console.log(`Created new Admin: ${admin.publicKey()}`);
    }

    await fundAccount(admin.publicKey());
    await fundAccount(issuer.publicKey());

    const server = new rpc.Server(RPC_URL, { allowHttp: true });

    if (!deployments['underlying_token']) {
        console.log("Setting up Mock USDC Asset...");
        const usdcAsset = new Asset('USDC', issuer.publicKey());
        let adminAcc = await server.getAccount(admin.publicKey());
        
        let tx = new TransactionBuilder(adminAcc, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
            .addOperation(Operation.changeTrust({ asset: usdcAsset }))
            .setTimeout(60)
            .build();
        tx.sign(admin);
        try {
            let res = await server.sendTransaction(tx);
            if (res.status === 'ERROR') console.warn(`Trustline may already exist or failed: ${JSON.stringify(res)}`);
        } catch(e) { console.warn("Trustline error caught (likely exists)."); }

        let issuerAcc = await server.getAccount(issuer.publicKey());
        tx = new TransactionBuilder(issuerAcc, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
            .addOperation(Operation.payment({ destination: admin.publicKey(), asset: usdcAsset, amount: '1000000' }))
            .setTimeout(60)
            .build();
        tx.sign(issuer);
        try {
            await server.sendTransaction(tx);
        } catch(e) { console.warn("Payment error caught (likely exists)."); }

        console.log("Wrapping USDC to Soroban contract...");
        const underlying_token = runCmd(`stellar contract asset deploy --asset USDC:${issuer.publicKey()} --source-account ${admin.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`);
        console.log(`Mock Underlying Token ID: ${underlying_token}`);
        deployments['underlying_token'] = underlying_token;
        saveDeployments(__dirname, deployments);
    } else {
        console.log(`Mock Token already deployed: ${deployments['underlying_token']}`);
    }

    console.log('Building contracts...');
    execSync('stellar contract build', { stdio: 'inherit', cwd: path.resolve(__dirname, '../contracts') });

    const contractsToDeploy = [
        'factory', 'sy_wrapper', 'vault', 'tokenizer', 'pt_token', 'yt_token', 
        'marketplace', 'intent_engine', 'rollover'
    ];

    for (const name of contractsToDeploy) {
        if (!deployments[`${name}_wasm`]) {
            console.log(`Uploading WASM for ${name}...`);
            const wasmPath = path.resolve(__dirname, `../contracts/target/wasm32v1-none/release/${name}.wasm`);
            const wasmId = runCmd(`stellar contract upload --wasm ${wasmPath} --source ${admin.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`);
            deployments[`${name}_wasm`] = wasmId;
            saveDeployments(__dirname, deployments);
            console.log(`Uploaded ${name} Wasm: ${wasmId}`);
        } else {
            console.log(`${name} WASM already uploaded: ${deployments[`${name}_wasm`]}`);
        }
        
        if (!deployments[name]) {
            console.log(`Deploying raw contract ${name}...`);
            const wasmId = deployments[`${name}_wasm`];
            const contractId = runCmd(`stellar contract deploy --wasm-hash ${wasmId} --source ${admin.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`);
            deployments[name] = contractId;
            saveDeployments(__dirname, deployments);
            console.log(`${name} deployed -> ${contractId}`);
        } else {
            console.log(`${name} already deployed: ${deployments[name]}`);
        }
    }

    if (!deployments['factory_initialized']) {
        console.log("Initializing Factory...");
        const out = runCmdNoFail(`stellar contract invoke --id ${deployments.factory} --source ${admin.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}" -- initialize --admin ${admin.publicKey()} --protocol_version 1`);
        if (out.includes("AlreadyInitialized") || !out.includes("error")) {
            console.log("Factory initialized successfully (or already was).");
            deployments['factory_initialized'] = "true";
            saveDeployments(__dirname, deployments);
        } else {
            console.warn(`Factory init issue: ${out}`);
        }
    } else {
        console.log("Factory already initialized.");
    }

    if (!deployments['epoch_deployed']) {
        console.log("Invoking Factory.deploy_epoch()...");
        const ledger = await server.getLatestLedger();
        const maturity_ledger = ledger.sequence + 5000;
        const grace_period_ledgers = 1000;
        const keeper = admin.publicKey();

        const paramsJson = JSON.stringify({
            maturity_ledger: maturity_ledger,
            underlying_token: deployments.underlying_token,
            sy_wrapper: deployments.sy_wrapper,
            vault: deployments.vault,
            pt_token: deployments.pt_token,
            yt_token: deployments.yt_token,
            tokenizer: deployments.tokenizer,
            marketplace: deployments.marketplace,
            intent_engine: deployments.intent_engine,
            rollover_engine: deployments.rollover,
            keeper: keeper,
            grace_period_ledgers: grace_period_ledgers
        });

        const invokeArgs = [
            `--id ${deployments.factory}`,
            `--source ${admin.secret()}`,
            `--rpc-url ${RPC_URL}`,
            `--network-passphrase "${NETWORK_PASSPHRASE}"`,
            `--`,
            `deploy_epoch`,
            `--params '${paramsJson}'`
        ].join(' ');

        const out = runCmdNoFail(`stellar contract invoke ${invokeArgs}`);
        if (out.includes("AlreadyInitialized")) {
            console.log("Epoch already deployed.");
            deployments['epoch_deployed'] = "true";
            saveDeployments(__dirname, deployments);
        } else if (out.includes("error")) {
            console.error(`Epoch deploy failed:\n${out}`);
            process.exit(1);
        } else if (out.trim() !== '') {
            console.log(`Epoch Deployed! Epoch ID: ${out.trim()}`);
            deployments['epoch_deployed'] = "true";
            saveDeployments(__dirname, deployments);
        } else {
            console.error(`Epoch deploy failed with empty output.`);
            process.exit(1);
        }
    } else {
        console.log("Epoch already deployed.");
    }

    console.log("Generating TypeScript Bindings...");
    for (const name of contractsToDeploy) {
        if (!deployments[`${name}_bindings`]) {
            runCmd(`stellar contract bindings typescript --id ${deployments[name]} --network testnet --overwrite --output-dir ./packages/bindings/${name}`);
            deployments[`${name}_bindings`] = "true";
            saveDeployments(__dirname, deployments);
        }
    }
    console.log("Deployment and Wiring Complete!");
}

deploy().catch((err) => {
    console.error("Deployment script failed entirely:", err);
    process.exit(1);
});
