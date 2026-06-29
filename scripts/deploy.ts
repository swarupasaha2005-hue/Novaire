import { Keypair, Network, rpc, TransactionBuilder, Contract, Asset, xdr } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Network.TESTNET;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function deploy() {
    if (!ADMIN_SECRET) {
        throw new Error('ADMIN_SECRET environment variable is required');
    }
    
    const adminKp = Keypair.fromSecret(ADMIN_SECRET);
    const server = new rpc.Server(RPC_URL, { allowHttp: true });

    console.log('Compiling contracts...');
    execSync('soroban contract build', { stdio: 'inherit', cwd: path.resolve(__dirname, '../') });

    const contracts = [
        'sy_wrapper',
        'vault',
        'tokenizer',
        'pt_token',
        'yt_token',
        'marketplace',
        'intent_engine',
        'maturity_engine',
        'rollover'
    ];

    const deployments: Record<string, string> = {};

    console.log(`Deploying from admin: ${adminKp.publicKey()}`);

    for (const name of contracts) {
        console.log(`Deploying ${name}...`);
        
        const wasmPath = path.resolve(__dirname, `../target/wasm32-unknown-unknown/release/${name}.wasm`);
        
        try {
            const wasmId = execSync(`soroban contract install --wasm ${wasmPath} --source ${adminKp.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`).toString().trim();
            console.log(`Wasm ID for ${name}: ${wasmId}`);
            
            const contractId = execSync(`soroban contract deploy --wasm-hash ${wasmId} --source ${adminKp.secret()} --rpc-url ${RPC_URL} --network-passphrase "${NETWORK_PASSPHRASE}"`).toString().trim();
            
            console.log(`Deployed ${name} to ${contractId}`);
            deployments[name] = contractId;
        } catch (e) {
            console.error(`Failed to deploy ${name}`, e);
            throw e;
        }
    }

    fs.writeFileSync(path.resolve(__dirname, 'deployments.json'), JSON.stringify(deployments, null, 2));
    console.log('Deployments saved to deployments.json');
}

deploy().catch(console.error);
