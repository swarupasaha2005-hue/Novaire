import { Keypair } from "@stellar/stellar-sdk";
import { networks, Client as YtClient } from "../packages/bindings/yt_token/src/index.ts";

async function main() {
    const ytClient = new YtClient({
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: networks.testnet.contractId,
        rpcUrl: "https://soroban-testnet.stellar.org",
    });

    const user = Keypair.random().publicKey();
    const tx = await ytClient.claimable_yield({ user });
    
    console.log(tx.result);
}

main().catch(console.error);
