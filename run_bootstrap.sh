#!/bin/bash
export VAULT=$(jq -r '.vault' ./scripts/deployments.testnet.json)
export TOKENIZER=$(jq -r '.tokenizer' ./scripts/deployments.testnet.json)
export MARKETPLACE=$(jq -r '.marketplace' ./scripts/deployments.testnet.json)
export SRC=$(jq -r '.admin_secret' ./scripts/testnet_keys.json)
export PUB=$(jq -r '.admin_public' ./scripts/testnet_keys.json)
export RPC="https://soroban-testnet.stellar.org"
export NP="Test SDF Network ; September 2015"

echo "Minting SY via Vault..."
stellar contract invoke --id $VAULT --source-account $SRC --rpc-url $RPC --network-passphrase "$NP" -- deposit --depositor $PUB --amount 1000000000

echo "Minting PT/YT via Tokenizer..."
stellar contract invoke --id $TOKENIZER --source-account $SRC --rpc-url $RPC --network-passphrase "$NP" -- mint_pt_yt --user $PUB --sy_shares 1000000000

echo "Adding Liquidity to Marketplace..."
stellar contract invoke --id $MARKETPLACE --source-account $SRC --rpc-url $RPC --network-passphrase "$NP" -- add_liquidity --provider $PUB --pt_amount 950000000 --underlying_amount 1000000000

echo "Reserves:"
stellar contract invoke --id $MARKETPLACE --source-account $SRC --rpc-url $RPC --network-passphrase "$NP" -- get_reserves
