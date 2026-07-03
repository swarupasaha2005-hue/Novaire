#!/bin/bash
export PT_TOKEN=$(jq -r '.pt_token' ./scripts/deployments.testnet.json)
export YT_TOKEN=$(jq -r '.yt_token' ./scripts/deployments.testnet.json)
export ISSUER_PUBLIC=$(jq -r '.issuer_public' ./scripts/testnet_keys.json)
export ADMIN_SECRET=$(jq -r '.admin_secret' ./scripts/testnet_keys.json)
export RPC="https://soroban-testnet.stellar.org"
export NP="Test SDF Network ; September 2015"

echo "1. PT Balance (Issuer):"
stellar contract invoke --id $PT_TOKEN --source-account $ADMIN_SECRET --rpc-url $RPC --network-passphrase "$NP" -- balance --id $ISSUER_PUBLIC

echo "2. YT Balance (Issuer):"
stellar contract invoke --id $YT_TOKEN --source-account $ADMIN_SECRET --rpc-url $RPC --network-passphrase "$NP" -- balance --id $ISSUER_PUBLIC
