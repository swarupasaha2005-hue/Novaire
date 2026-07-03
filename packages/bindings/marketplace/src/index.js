"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.NovaireMarketError = exports.networks = exports.rpc = exports.contract = void 0;
var buffer_1 = require("buffer");
var contract_1 = require("@stellar/stellar-sdk/contract");
__exportStar(require("@stellar/stellar-sdk"), exports);
exports.contract = __importStar(require("@stellar/stellar-sdk/contract"));
exports.rpc = __importStar(require("@stellar/stellar-sdk/rpc"));
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || buffer_1.Buffer;
}
exports.networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBPNEANW72FY4WMN65KUWCXCCT5TBSJEG43JRO64RALCBKYSTPQBSKPJ",
    }
};
exports.NovaireMarketError = {
    1: { message: "AlreadyInitialized" },
    2: { message: "NotInitialized" },
    3: { message: "Unauthorized" },
    4: { message: "EpochExpired" },
    5: { message: "InsufficientLiquidity" },
    6: { message: "SlippageExceeded" },
    7: { message: "ZeroInput" },
    8: { message: "BelowMinimumLiquidity" },
    9: { message: "StorageMissing" },
    10: { message: "InvariantViolated" },
    11: { message: "MathOverflow" }
};
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(options) {
        var _this = _super.call(this, new contract_1.Spec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAADwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAHUHRUb2tlbgAAAAAAAAAAAAAAAAdZdFRva2VuAAAAAAAAAAAAAAAAClVuZGVybHlpbmcAAAAAAAAAAAAAAAAACVN5V3JhcHBlcgAAAAAAAAAAAAAAAAAACVRva2VuaXplcgAAAAAAAAAAAAAAAAAADk1hdHVyaXR5TGVkZ2VyAAAAAAAAAAAAAAAAAA1DcmVhdGVkTGVkZ2VyAAAAAAAAAAAAAAAAAAAKUHRSZXNlcnZlcwAAAAAAAAAAAAAAAAASVW5kZXJseWluZ1Jlc2VydmVzAAAAAAAAAAAAAAAAAApZdFJlc2VydmVzAAAAAAAAAAAAAAAAAA1Ub3RhbExwU2hhcmVzAAAAAAAAAAAAAAAAAAAPSW1wbGllZFJhdGVUd2FwAAAAAAAAAAAAAAAADkxhc3RUd2FwTGVkZ2VyAAAAAAABAAAAAAAAAAlMcEJhbGFuY2UAAAAAAAABAAAAEw==",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAhwdF90b2tlbgAAABMAAAAAAAAACHl0X3Rva2VuAAAAEwAAAAAAAAAKdW5kZXJseWluZwAAAAAAEwAAAAAAAAAKc3lfd3JhcHBlcgAAAAAAEwAAAAAAAAAJdG9rZW5pemVyAAAAAAAAEwAAAAAAAAAPbWF0dXJpdHlfbGVkZ2VyAAAAAAQAAAABAAAD6QAAA+0AAAAAAAAH0AAAABJOb3ZhaXJlTWFya2V0RXJyb3IAAA==",
            "AAAAAAAAAAAAAAAMZ2V0X3B0X3ByaWNlAAAAAAAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZU1hcmtldEVycm9yAAA=",
            "AAAAAAAAAAAAAAAMZ2V0X3Jlc2VydmVzAAAAAAAAAAEAAAPpAAAD7QAAAAMAAAALAAAACwAAAAsAAAfQAAAAEk5vdmFpcmVNYXJrZXRFcnJvcgAA",
            "AAAAAAAAAAAAAAANYWRkX2xpcXVpZGl0eQAAAAAAAAMAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAJcHRfYW1vdW50AAAAAAAACwAAAAAAAAARdW5kZXJseWluZ19hbW91bnQAAAAAAAALAAAAAQAAA+kAAAALAAAH0AAAABJOb3ZhaXJlTWFya2V0RXJyb3IAAA==",
            "AAAAAAAAAAAAAAANZ2V0X3R3YXBfcmF0ZQAAAAAAAAAAAAABAAAD6QAAAAsAAAfQAAAAEk5vdmFpcmVNYXJrZXRFcnJvcgAA",
            "AAAAAAAAAAAAAAAQcmVtb3ZlX2xpcXVpZGl0eQAAAAIAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAJbHBfc2hhcmVzAAAAAAAACwAAAAEAAAPpAAAD7QAAAAIAAAALAAAACwAAB9AAAAASTm92YWlyZU1hcmtldEVycm9yAAA=",
            "AAAABAAAAAAAAAAAAAAAEk5vdmFpcmVNYXJrZXRFcnJvcgAAAAAACwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAMVW5hdXRob3JpemVkAAAAAwAAAAAAAAAMRXBvY2hFeHBpcmVkAAAABAAAAAAAAAAVSW5zdWZmaWNpZW50TGlxdWlkaXR5AAAAAAAABQAAAAAAAAAQU2xpcHBhZ2VFeGNlZWRlZAAAAAYAAAAAAAAACVplcm9JbnB1dAAAAAAAAAcAAAAAAAAAFUJlbG93TWluaW11bUxpcXVpZGl0eQAAAAAAAAgAAAAAAAAADlN0b3JhZ2VNaXNzaW5nAAAAAAAJAAAAAAAAABFJbnZhcmlhbnRWaW9sYXRlZAAAAAAAAAoAAAAAAAAADE1hdGhPdmVyZmxvdwAAAAs=",
            "AAAAAAAAAAAAAAAWc3dhcF9wdF9mb3JfdW5kZXJseWluZwAAAAAAAwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAVwdF9pbgAAAAAAAAsAAAAAAAAAEm1pbl91bmRlcmx5aW5nX291dAAAAAAACwAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZU1hcmtldEVycm9yAAA=",
            "AAAAAAAAAAAAAAAWc3dhcF91bmRlcmx5aW5nX2Zvcl9wdAAAAAAAAwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAA11bmRlcmx5aW5nX2luAAAAAAAACwAAAAAAAAAKbWluX3B0X291dAAAAAAACwAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZU1hcmtldEVycm9yAAA=",
            "AAAAAAAAAAAAAAAWc3dhcF91bmRlcmx5aW5nX2Zvcl95dAAAAAAAAwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAA11bmRlcmx5aW5nX2luAAAAAAAACwAAAAAAAAAKbWluX3l0X291dAAAAAAACwAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZU1hcmtldEVycm9yAAA=",
            "AAAAAAAAAAAAAAAWc3dhcF95dF9mb3JfdW5kZXJseWluZwAAAAAAAwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAV5dF9pbgAAAAAAAAsAAAAAAAAAEm1pbl91bmRlcmx5aW5nX291dAAAAAAACwAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZU1hcmtldEVycm9yAAA="]), options) || this;
        _this.options = options;
        _this.fromJSON = {
            initialize: (_this.txFromJSON),
            get_pt_price: (_this.txFromJSON),
            get_reserves: (_this.txFromJSON),
            add_liquidity: (_this.txFromJSON),
            get_twap_rate: (_this.txFromJSON),
            remove_liquidity: (_this.txFromJSON),
            swap_pt_for_underlying: (_this.txFromJSON),
            swap_underlying_for_pt: (_this.txFromJSON),
            swap_underlying_for_yt: (_this.txFromJSON),
            swap_yt_for_underlying: (_this.txFromJSON)
        };
        return _this;
    }
    Client.deploy = function (
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, contract_1.Client.deploy(null, options)];
            });
        });
    };
    return Client;
}(contract_1.Client));
exports.Client = Client;
