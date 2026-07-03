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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.Client = exports.NovaireIntentError = exports.networks = exports.rpc = exports.contract = void 0;
var buffer_1 = require("buffer");
var contract_1 = require("@stellar/stellar-sdk/contract");
__exportStar(require("@stellar/stellar-sdk"), exports);
exports.contract = require("@stellar/stellar-sdk/contract");
exports.rpc = require("@stellar/stellar-sdk/rpc");
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || buffer_1.Buffer;
}
exports.networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CB3YHG26ICWV5SZEB5SWGDER7TBYY4QBQNXZZFBM3HVVYLZHJWUQHUSW",
    }
};
exports.NovaireIntentError = {
    1: { message: "Paused" },
    2: { message: "Unauthorized" },
    3: { message: "ZeroAmount" },
    4: { message: "RateTooLow" },
    5: { message: "IntentFailed" },
    6: { message: "AlreadyInitialized" },
    7: { message: "StorageMissing" },
    8: { message: "InvariantViolated" },
    9: { message: "InvalidPercentage" }
};
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(options) {
        var _this = _super.call(this, new contract_1.Spec(["AAAAAAAAAAAAAAAFcGF1c2UAAAAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
            "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAFVmF1bHQAAAAAAAAAAAAAAAAAAAlUb2tlbml6ZXIAAAAAAAAAAAAAAAAAAAtNYXJrZXRwbGFjZQAAAAAAAAAAAAAAAAlTeVdyYXBwZXIAAAAAAAAAAAAAAAAAAApVbmRlcmx5aW5nAAAAAAAAAAAAAAAAAAdQdFRva2VuAAAAAAAAAAAAAAAAB1l0VG9rZW4AAAAAAAAAAAAAAAAGUGF1c2VkAAAAAAABAAAAAAAAAAtVc2VySW50ZW50cwAAAAABAAAAEw==",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAACAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV2YXVsdAAAAAAAABMAAAAAAAAACXRva2VuaXplcgAAAAAAABMAAAAAAAAAC21hcmtldHBsYWNlAAAAABMAAAAAAAAACnN5X3dyYXBwZXIAAAAAABMAAAAAAAAACnVuZGVybHlpbmcAAAAAABMAAAAAAAAACHB0X3Rva2VuAAAAEwAAAAAAAAAIeXRfdG9rZW4AAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
            "AAAAAQAAAAAAAAAAAAAADEludGVudFJlY29yZAAAAAYAAAAAAAAADmNyZWF0ZWRfbGVkZ2VyAAAAAAAEAAAAAAAAABBkZXBvc2l0ZWRfYW1vdW50AAAACwAAAAAAAAAVaW1wbGllZF9yYXRlX2F0X2VudHJ5AAAAAAAACwAAAAAAAAAPbWF0dXJpdHlfbGVkZ2VyAAAAAAQAAAAAAAAAB3B0X2hlbGQAAAAACwAAAAAAAAAHeXRfc29sZAAAAAAL",
            "AAAAAAAAAAAAAAAPZ2V0X3VzZXJfaW50ZW50AAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAfQAAAADEludGVudFJlY29yZAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
            "AAAABAAAAAAAAAAAAAAAEk5vdmFpcmVJbnRlbnRFcnJvcgAAAAAACQAAAAAAAAAGUGF1c2VkAAAAAAABAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAACAAAAAAAAAApaZXJvQW1vdW50AAAAAAADAAAAAAAAAApSYXRlVG9vTG93AAAAAAAEAAAAAAAAAAxJbnRlbnRGYWlsZWQAAAAFAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAYAAAAAAAAADlN0b3JhZ2VNaXNzaW5nAAAAAAAHAAAAAAAAABFJbnZhcmlhbnRWaW9sYXRlZAAAAAAAAAgAAAAAAAAAEUludmFsaWRQZXJjZW50YWdlAAAAAAAACQ==",
            "AAAAAAAAAAAAAAAVZ2V0X2N1cnJlbnRfYmVzdF9yYXRlAAAAAAAAAAAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
            "AAAAAAAAAAAAAAAaZXhlY3V0ZV9maXhlZF95aWVsZF9pbnRlbnQAAAAAAAUAAAAAAAAABHVzZXIAAAATAAAAAAAAAAt1c2RjX2Ftb3VudAAAAAALAAAAAAAAABBtaW5faW1wbGllZF9yYXRlAAAACwAAAAAAAAAQX21hdHVyaXR5X2xlZGdlcgAAAAQAAAAAAAAAEnl0X3NhbGVfcGVyY2VudGFnZQAAAAAABAAAAAEAAAPpAAAH0AAAAAxJbnRlbnRSZWNvcmQAAAfQAAAAEk5vdmFpcmVJbnRlbnRFcnJvcgAA",
            "AAAAAAAAAAAAAAAgZXhlY3V0ZV95aWVsZF9zcGVjdWxhdGlvbl9pbnRlbnQAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAALdXNkY19hbW91bnQAAAAACwAAAAAAAAAKbWluX3l0X291dAAAAAAACwAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA="]), options) || this;
        _this.options = options;
        _this.fromJSON = {
            pause: (_this.txFromJSON),
            unpause: (_this.txFromJSON),
            initialize: (_this.txFromJSON),
            get_user_intent: (_this.txFromJSON),
            get_current_best_rate: (_this.txFromJSON),
            execute_fixed_yield_intent: (_this.txFromJSON),
            execute_yield_speculation_intent: (_this.txFromJSON)
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
