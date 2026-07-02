"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORK_PASSPHRASE = exports.RPC_URL = exports.NETWORK = exports.CONTRACTS = void 0;
var deployments_testnet_json_1 = __importDefault(require("./deployments.testnet.json"));
exports.CONTRACTS = {
    FACTORY: deployments_testnet_json_1.default.factory,
    VAULT: deployments_testnet_json_1.default.vault,
    PT_TOKEN: deployments_testnet_json_1.default.pt_token,
    YT_TOKEN: deployments_testnet_json_1.default.yt_token,
    SY_WRAPPER: deployments_testnet_json_1.default.sy_wrapper,
    MARKETPLACE: deployments_testnet_json_1.default.marketplace,
    INTENT_ENGINE: deployments_testnet_json_1.default.intent_engine,
    ROLLOVER: deployments_testnet_json_1.default.rollover,
    TOKENIZER: deployments_testnet_json_1.default.tokenizer,
    MOCK_USDC: deployments_testnet_json_1.default.underlying_token,
};
exports.NETWORK = 'TESTNET';
exports.RPC_URL = 'https://soroban-testnet.stellar.org';
exports.NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
