import { Keypair, rpc, Networks } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
const DEPLOYMENTS_FILE = path.resolve(__dirname, 'deployments.testnet.json');

const XLM_NATIVE_SAC = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

let deployments: Record<string, string> = {};
if (fs.existsSync(DEPLOYMENTS_FILE)) {
    deployments = JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, 'utf-8'));
} else {
    throw new Error('deployments.testnet.json not found! Must have initial deployment and WASM hashes.');
}

function saveDeployments() {
    fs.writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(deployments, null, 2));
}

function runCmd(cmd: string, retries: number = 5): string {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Executing: ${cmd}`);
            const result = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
            return result;
        } catch (e: any) {
            const stderr = e.stderr ? e.stderr.toString() : '';
            console.warn(`Command failed: ${e.message}\nStderr: ${stderr}`);
            if (i === retries - 1) throw e;
            const sleepTime = Math.pow(2, i) * 2000;
            console.log(`Sleeping for ${sleepTime}ms...`);
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

async function deployXlmEpoch() {
    const KEYS_FILE = path.resolve(__dirname, 'testnet_keys.json');
    if (!fs.existsSync(KEYS_FILE)) {
        throw new Error('testnet_keys.json not found!');
    }
    
    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
    const admin = Keypair.fromSecret(keys.admin_secret);
    
    console.log(`Using Admin: ${admin.publicKey()}`);

    const server = new rpc.Server(RPC_URL, { allowHttp: true });

    // Ensure Factory exists
    if (!deployments['factory']) {
        throw new Error('Factory contract not found in deployments!');
    }

    console.log(`Setting underlying token to Native XLM SAC: ${XLM_NATIVE_SAC}`);
    deployments['underlying_token'] = XLM_NATIVE_SAC;
    saveDeployments();

    const contractsToDeploy = [
        'sy_wrapper', 'vault', 'tokenizer', 'pt_token', 'yt_token', 
        'marketplace', 'intent_engine', 'rollover'
    ];

    function deployWasm(name: string, wasmHash: string): string {
        console.log(`Deploying ${name} from wasm hash ${wasmHash}...`);
        const cmd = `stellar contract deploy --wasm-hash ${wasmHash} --source ${admin.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}" --fee 1000000`;
        console.log(`Executing: ${cmd}`);
        const result = runCmd(cmd);
        console.log(`${name} deployed -> ${result}`);
        return result;
    }

    console.log('Deploying new instances for XLM epoch...');
    for (const name of contractsToDeploy) {
        const wasmId = deployments[`${name}_wasm`];
        if (!wasmId) {
            throw new Error(`WASM hash not found for ${name}`);
        }
        const contractId = deployWasm(name, wasmId);
        deployments[name] = contractId;
        saveDeployments();
    }

    console.log("Invoking Factory.deploy_epoch()...");
    const ledger = await server.getLatestLedger();
    const maturity_ledger = ledger.sequence + 50000;
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
    } else if (!out.includes("error") && out.trim() !== '') {
        console.log(`Epoch Deployed! Epoch ID: ${out.trim()}`);
    } else {
        console.warn(`Epoch deploy failed: ${out}`);
    }

    console.log("Generating TypeScript Bindings for new XLM Epoch...");
    for (const name of contractsToDeploy) {
        runCmd(`stellar contract bindings typescript --id ${deployments[name]} --network testnet --output-dir ../packages/bindings/${name} --overwrite`);
    }
    
    // Also regenerate factory just in case
    runCmd(`stellar contract bindings typescript --id ${deployments.factory} --network testnet --output-dir ../packages/bindings/factory --overwrite`);

    console.log("XLM Epoch Deployment and Wiring Complete!");
}

deployXlmEpoch().catch((err) => {
    console.error("XLM Deployment script failed:", err);
    process.exit(1);
});
