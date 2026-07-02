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
    contractId: "CCIPGL3N67PXLOKVHNUHQY7VRV577P2IKO6FNL3CFNPZSIPGICX23CKQ",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "Tokenizer", values: void} | {tag: "Vault", values: void} | {tag: "Marketplace", values: void} | {tag: "IntentEngine", values: void} | {tag: "Keeper", values: void} | {tag: "RolloverPositions", values: readonly [string]} | {tag: "PtToken", values: void} | {tag: "UnderlyingToken", values: void} | {tag: "Paused", values: void} | {tag: "GracePeriodLedgers", values: void} | {tag: "TotalPtHeld", values: void};


export interface IntentRecord {
  created_ledger: u32;
  deposited_amount: i128;
  implied_rate_at_entry: i128;
  maturity_ledger: u32;
  pt_held: i128;
  yt_sold: i128;
}


export interface RolloverPosition {
  active: boolean;
  created_ledger: u32;
  current_epoch_maturity: u32;
  last_rolled_ledger: u32;
  min_rate_bps: i128;
  next_epoch_maturity: u32;
  original_usdc: i128;
  pt_balance: i128;
  total_yield_earned: i128;
}

export const NovaireRolloverError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"Unauthorized"},
  3: {message:"PositionNotFound"},
  4: {message:"EpochNotExpired"},
  5: {message:"NextEpochNotSet"},
  6: {message:"PositionNotActive"},
  7: {message:"RateTooLow"},
  8: {message:"ZeroAmount"},
  9: {message:"StorageMissing"},
  10: {message:"MathOverflow"},
  11: {message:"MathUnderflow"},
  12: {message:"Paused"},
  13: {message:"InvariantViolation"},
  14: {message:"InvalidKeeper"},
  15: {message:"InvalidEpoch"}
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
  initialize: ({admin, tokenizer, vault, marketplace, intent_engine, keeper, pt_token, underlying_token, grace_period_ledgers}: {admin: string, tokenizer: string, vault: string, marketplace: string, intent_engine: string, keeper: string, pt_token: string, underlying_token: string, grace_period_ledgers: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_position: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<RolloverPosition>>>

  /**
   * Construct and simulate a exit_rollover transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  exit_rollover: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a update_keeper transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_keeper: ({new_keeper}: {new_keeper: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_next_epoch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_next_epoch: ({user, next_epoch_maturity}: {user: string, next_epoch_maturity: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a execute_rollover transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_rollover: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a register_rollover transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_rollover: ({user, pt_amount, current_epoch_maturity, next_epoch_maturity, min_rate_bps}: {user: string, pt_amount: i128, current_epoch_maturity: u32, next_epoch_maturity: u32, min_rate_bps: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

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
      new ContractSpec([ "AAAAAAAAAAAAAAAFcGF1c2UAAAAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAUTm92YWlyZVJvbGxvdmVyRXJyb3I=",
        "AAAAAAAAAAAAAAAHdW5wYXVzZQAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAUTm92YWlyZVJvbGxvdmVyRXJyb3I=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAADAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAJVG9rZW5pemVyAAAAAAAAAAAAAAAAAAAFVmF1bHQAAAAAAAAAAAAAAAAAAAtNYXJrZXRwbGFjZQAAAAAAAAAAAAAAAAxJbnRlbnRFbmdpbmUAAAAAAAAAAAAAAAZLZWVwZXIAAAAAAAEAAAAAAAAAEVJvbGxvdmVyUG9zaXRpb25zAAAAAAAAAQAAABMAAAAAAAAAAAAAAAdQdFRva2VuAAAAAAAAAAAAAAAAD1VuZGVybHlpbmdUb2tlbgAAAAAAAAAAAAAAAAZQYXVzZWQAAAAAAAAAAAAAAAAAEkdyYWNlUGVyaW9kTGVkZ2VycwAAAAAAAAAAAAAAAAALVG90YWxQdEhlbGQA",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAACQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAl0b2tlbml6ZXIAAAAAAAATAAAAAAAAAAV2YXVsdAAAAAAAABMAAAAAAAAAC21hcmtldHBsYWNlAAAAABMAAAAAAAAADWludGVudF9lbmdpbmUAAAAAAAATAAAAAAAAAAZrZWVwZXIAAAAAABMAAAAAAAAACHB0X3Rva2VuAAAAEwAAAAAAAAAQdW5kZXJseWluZ190b2tlbgAAABMAAAAAAAAAFGdyYWNlX3BlcmlvZF9sZWRnZXJzAAAABAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAAFE5vdmFpcmVSb2xsb3ZlckVycm9y",
        "AAAAAAAAAAAAAAAMZ2V0X3Bvc2l0aW9uAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAB9AAAAAQUm9sbG92ZXJQb3NpdGlvbgAAB9AAAAAUTm92YWlyZVJvbGxvdmVyRXJyb3I=",
        "AAAAAAAAAAAAAAANZXhpdF9yb2xsb3ZlcgAAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAUTm92YWlyZVJvbGxvdmVyRXJyb3I=",
        "AAAAAAAAAAAAAAANdXBkYXRlX2tlZXBlcgAAAAAAAAEAAAAAAAAACm5ld19rZWVwZXIAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAABROb3ZhaXJlUm9sbG92ZXJFcnJvcg==",
        "AAAAAAAAAAAAAAAOc2V0X25leHRfZXBvY2gAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAABNuZXh0X2Vwb2NoX21hdHVyaXR5AAAAAAQAAAABAAAD6QAAA+0AAAAAAAAH0AAAABROb3ZhaXJlUm9sbG92ZXJFcnJvcg==",
        "AAAAAQAAAAAAAAAAAAAADEludGVudFJlY29yZAAAAAYAAAAAAAAADmNyZWF0ZWRfbGVkZ2VyAAAAAAAEAAAAAAAAABBkZXBvc2l0ZWRfYW1vdW50AAAACwAAAAAAAAAVaW1wbGllZF9yYXRlX2F0X2VudHJ5AAAAAAAACwAAAAAAAAAPbWF0dXJpdHlfbGVkZ2VyAAAAAAQAAAAAAAAAB3B0X2hlbGQAAAAACwAAAAAAAAAHeXRfc29sZAAAAAAL",
        "AAAAAAAAAAAAAAAQZXhlY3V0ZV9yb2xsb3ZlcgAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAUTm92YWlyZVJvbGxvdmVyRXJyb3I=",
        "AAAAAAAAAAAAAAARcmVnaXN0ZXJfcm9sbG92ZXIAAAAAAAAFAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAJcHRfYW1vdW50AAAAAAAACwAAAAAAAAAWY3VycmVudF9lcG9jaF9tYXR1cml0eQAAAAAABAAAAAAAAAATbmV4dF9lcG9jaF9tYXR1cml0eQAAAAAEAAAAAAAAAAxtaW5fcmF0ZV9icHMAAAALAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAUTm92YWlyZVJvbGxvdmVyRXJyb3I=",
        "AAAAAQAAAAAAAAAAAAAAEFJvbGxvdmVyUG9zaXRpb24AAAAJAAAAAAAAAAZhY3RpdmUAAAAAAAEAAAAAAAAADmNyZWF0ZWRfbGVkZ2VyAAAAAAAEAAAAAAAAABZjdXJyZW50X2Vwb2NoX21hdHVyaXR5AAAAAAAEAAAAAAAAABJsYXN0X3JvbGxlZF9sZWRnZXIAAAAAAAQAAAAAAAAADG1pbl9yYXRlX2JwcwAAAAsAAAAAAAAAE25leHRfZXBvY2hfbWF0dXJpdHkAAAAABAAAAAAAAAANb3JpZ2luYWxfdXNkYwAAAAAAAAsAAAAAAAAACnB0X2JhbGFuY2UAAAAAAAsAAAAAAAAAEnRvdGFsX3lpZWxkX2Vhcm5lZAAAAAAACw==",
        "AAAABAAAAAAAAAAAAAAAFE5vdmFpcmVSb2xsb3ZlckVycm9yAAAADwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAACAAAAAAAAABBQb3NpdGlvbk5vdEZvdW5kAAAAAwAAAAAAAAAPRXBvY2hOb3RFeHBpcmVkAAAAAAQAAAAAAAAAD05leHRFcG9jaE5vdFNldAAAAAAFAAAAAAAAABFQb3NpdGlvbk5vdEFjdGl2ZQAAAAAAAAYAAAAAAAAAClJhdGVUb29Mb3cAAAAAAAcAAAAAAAAAClplcm9BbW91bnQAAAAAAAgAAAAAAAAADlN0b3JhZ2VNaXNzaW5nAAAAAAAJAAAAAAAAAAxNYXRoT3ZlcmZsb3cAAAAKAAAAAAAAAA1NYXRoVW5kZXJmbG93AAAAAAAACwAAAAAAAAAGUGF1c2VkAAAAAAAMAAAAAAAAABJJbnZhcmlhbnRWaW9sYXRpb24AAAAAAA0AAAAAAAAADUludmFsaWRLZWVwZXIAAAAAAAAOAAAAAAAAAAxJbnZhbGlkRXBvY2gAAAAP" ]),
      options
    )
  }
  public readonly fromJSON = {
    pause: this.txFromJSON<Result<void>>,
        unpause: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<Result<void>>,
        get_position: this.txFromJSON<Result<RolloverPosition>>,
        exit_rollover: this.txFromJSON<Result<void>>,
        update_keeper: this.txFromJSON<Result<void>>,
        set_next_epoch: this.txFromJSON<Result<void>>,
        execute_rollover: this.txFromJSON<Result<void>>,
        register_rollover: this.txFromJSON<Result<void>>
  }
}