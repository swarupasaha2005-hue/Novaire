import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDV5N65LETNMUZB22X7RCTNCBQYG7GEK2WN6UK5JSCHH6SXP5JQNMNN3",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "Vault", values: void} | {tag: "Tokenizer", values: void} | {tag: "Marketplace", values: void} | {tag: "SyWrapper", values: void} | {tag: "Underlying", values: void} | {tag: "PtToken", values: void} | {tag: "YtToken", values: void} | {tag: "Paused", values: void} | {tag: "UserIntents", values: readonly [string]};


export interface IntentRecord {
  created_ledger: u32;
  deposited_amount: i128;
  implied_rate_at_entry: i128;
  maturity_ledger: u32;
  pt_held: i128;
  yt_sold: i128;
}

export const NovaireIntentError = {
  1: {message:"Paused"},
  2: {message:"Unauthorized"},
  3: {message:"ZeroAmount"},
  4: {message:"RateTooLow"},
  5: {message:"IntentFailed"},
  6: {message:"AlreadyInitialized"},
  7: {message:"StorageMissing"},
  8: {message:"InvariantViolated"}
}

export interface Client {
  /**
   * Construct and simulate a pause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unpause transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unpause: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, vault, tokenizer, marketplace, sy_wrapper, underlying, pt_token, yt_token}: {admin: string, vault: string, tokenizer: string, marketplace: string, sy_wrapper: string, underlying: string, pt_token: string, yt_token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_user_intent transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_intent: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<IntentRecord>>>

  /**
   * Construct and simulate a get_current_best_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_current_best_rate: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a execute_fixed_yield_intent transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_fixed_yield_intent: ({user, usdc_amount, min_implied_rate, _maturity_ledger}: {user: string, usdc_amount: i128, min_implied_rate: i128, _maturity_ledger: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<IntentRecord>>>

  /**
   * Construct and simulate a execute_yield_speculation_intent transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_yield_speculation_intent: ({user, usdc_amount, min_yt_out}: {user: string, usdc_amount: i128, min_yt_out: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAFcGF1c2UAAAAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
        "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAFVmF1bHQAAAAAAAAAAAAAAAAAAAlUb2tlbml6ZXIAAAAAAAAAAAAAAAAAAAtNYXJrZXRwbGFjZQAAAAAAAAAAAAAAAAlTeVdyYXBwZXIAAAAAAAAAAAAAAAAAAApVbmRlcmx5aW5nAAAAAAAAAAAAAAAAAAdQdFRva2VuAAAAAAAAAAAAAAAAB1l0VG9rZW4AAAAAAAAAAAAAAAAGUGF1c2VkAAAAAAABAAAAAAAAAAtVc2VySW50ZW50cwAAAAABAAAAEw==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAACAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV2YXVsdAAAAAAAABMAAAAAAAAACXRva2VuaXplcgAAAAAAABMAAAAAAAAAC21hcmtldHBsYWNlAAAAABMAAAAAAAAACnN5X3dyYXBwZXIAAAAAABMAAAAAAAAACnVuZGVybHlpbmcAAAAAABMAAAAAAAAACHB0X3Rva2VuAAAAEwAAAAAAAAAIeXRfdG9rZW4AAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
        "AAAAAQAAAAAAAAAAAAAADEludGVudFJlY29yZAAAAAYAAAAAAAAADmNyZWF0ZWRfbGVkZ2VyAAAAAAAEAAAAAAAAABBkZXBvc2l0ZWRfYW1vdW50AAAACwAAAAAAAAAVaW1wbGllZF9yYXRlX2F0X2VudHJ5AAAAAAAACwAAAAAAAAAPbWF0dXJpdHlfbGVkZ2VyAAAAAAQAAAAAAAAAB3B0X2hlbGQAAAAACwAAAAAAAAAHeXRfc29sZAAAAAAL",
        "AAAAAAAAAAAAAAAPZ2V0X3VzZXJfaW50ZW50AAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAfQAAAADEludGVudFJlY29yZAAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
        "AAAABAAAAAAAAAAAAAAAEk5vdmFpcmVJbnRlbnRFcnJvcgAAAAAACAAAAAAAAAAGUGF1c2VkAAAAAAABAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAACAAAAAAAAAApaZXJvQW1vdW50AAAAAAADAAAAAAAAAApSYXRlVG9vTG93AAAAAAAEAAAAAAAAAAxJbnRlbnRGYWlsZWQAAAAFAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAYAAAAAAAAADlN0b3JhZ2VNaXNzaW5nAAAAAAAHAAAAAAAAABFJbnZhcmlhbnRWaW9sYXRlZAAAAAAAAAg=",
        "AAAAAAAAAAAAAAAVZ2V0X2N1cnJlbnRfYmVzdF9yYXRlAAAAAAAAAAAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=",
        "AAAAAAAAAAAAAAAaZXhlY3V0ZV9maXhlZF95aWVsZF9pbnRlbnQAAAAAAAQAAAAAAAAABHVzZXIAAAATAAAAAAAAAAt1c2RjX2Ftb3VudAAAAAALAAAAAAAAABBtaW5faW1wbGllZF9yYXRlAAAACwAAAAAAAAAQX21hdHVyaXR5X2xlZGdlcgAAAAQAAAABAAAD6QAAB9AAAAAMSW50ZW50UmVjb3JkAAAH0AAAABJOb3ZhaXJlSW50ZW50RXJyb3IAAA==",
        "AAAAAAAAAAAAAAAgZXhlY3V0ZV95aWVsZF9zcGVjdWxhdGlvbl9pbnRlbnQAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAALdXNkY19hbW91bnQAAAAACwAAAAAAAAAKbWluX3l0X291dAAAAAAACwAAAAEAAAPpAAAACwAAB9AAAAASTm92YWlyZUludGVudEVycm9yAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    pause: this.txFromJSON<Result<void>>,
        unpause: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<Result<void>>,
        get_user_intent: this.txFromJSON<Result<IntentRecord>>,
        get_current_best_rate: this.txFromJSON<Result<i128>>,
        execute_fixed_yield_intent: this.txFromJSON<Result<IntentRecord>>,
        execute_yield_speculation_intent: this.txFromJSON<Result<i128>>
  }
}