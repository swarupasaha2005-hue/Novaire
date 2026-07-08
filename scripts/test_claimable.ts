import { Client as YtClient, networks } from "../packages/bindings/yt_token/src/index";
import { Keypair } from "@stellar/stellar-sdk";

async function main() {
    const rpcUrl = "https://soroban-testnet.stellar.org";
    const ytClient = new YtClient({
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: networks.testnet.contractId,
        rpcUrl,
    });

    // Generate a random user to see what it returns
    const user = Keypair.random().publicKey();
    console.log("Fetching for:", user);

    try {
        const tx = await ytClient.claimable_yield({ user });
        console.log("Raw claimable tx result:", JSON.stringify(tx.result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
