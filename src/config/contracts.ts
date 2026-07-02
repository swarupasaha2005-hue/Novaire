import deployments from './deployments.testnet.json';

export const CONTRACTS = {
  FACTORY: deployments.factory,
  VAULT: deployments.vault,
  PT_TOKEN: deployments.pt_token,
  YT_TOKEN: deployments.yt_token,
  SY_WRAPPER: deployments.sy_wrapper,
  MARKETPLACE: deployments.marketplace,
  INTENT_ENGINE: deployments.intent_engine,
  ROLLOVER: deployments.rollover,
  TOKENIZER: deployments.tokenizer,
  MOCK_USDC: deployments.underlying_token,
};

export const NETWORK = 'TESTNET';
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
