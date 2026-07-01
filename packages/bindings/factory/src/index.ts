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
    contractId: "CCQB7V35EXBJGXIHVCCBO3WRRV5FFVRFMY2NIY6IJHG4G5DLBIAJKVUJ",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "ProtocolVersion", values: void} | {tag: "EpochCount", values: void} | {tag: "Epoch", values: readonly [u32]};


export interface EpochRecord {
  deployment_ledger: u32;
  epoch_id: u32;
  intent_engine: string;
  is_active: boolean;
  marketplace: string;
  maturity_ledger: u32;
  pt_token: string;
  rollover_engine: string;
  sy_wrapper: string;
  tokenizer: string;
  vault: string;
  version: u32;
  yt_token: string;
}


export interface DeployEpochParams {
  grace_period_ledgers: u32;
  intent_engine: string;
  keeper: string;
  marketplace: string;
  maturity_ledger: u32;
  pt_token: string;
  rollover_engine: string;
  sy_wrapper: string;
  tokenizer: string;
  underlying_token: string;
  vault: string;
  yt_token: string;
}

export const NovaireFactoryError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"Unauthorized"},
  4: {message:"EpochAlreadyExists"},
  5: {message:"InvalidEpoch"},
  6: {message:"MathOverflow"},
  7: {message:"StorageMissing"}
}

export interface Client {
  /**
   * Construct and simulate a get_epoch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_epoch: ({epoch_id}: {epoch_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<EpochRecord>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, protocol_version}: {admin: string, protocol_version: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a epoch_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  epoch_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a deploy_epoch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deploy_epoch: ({params}: {params: DeployEpochParams}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a latest_epoch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  latest_epoch: (options?: MethodOptions) => Promise<AssembledTransaction<Result<EpochRecord>>>

  /**
   * Construct and simulate a protocol_version transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  protocol_version: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

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
      new ContractSpec([ "AAAAAAAAAAAAAAAJZ2V0X2Vwb2NoAAAAAAAAAQAAAAAAAAAIZXBvY2hfaWQAAAAEAAAAAQAAA+kAAAfQAAAAC0Vwb2NoUmVjb3JkAAAAB9AAAAATTm92YWlyZUZhY3RvcnlFcnJvcgA=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAPUHJvdG9jb2xWZXJzaW9uAAAAAAAAAAAAAAAACkVwb2NoQ291bnQAAAAAAAEAAAAAAAAABUVwb2NoAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABBwcm90b2NvbF92ZXJzaW9uAAAABAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAAE05vdmFpcmVGYWN0b3J5RXJyb3IA",
        "AAAAAAAAAAAAAAALZXBvY2hfY291bnQAAAAAAAAAAAEAAAAE",
        "AAAAAAAAAAAAAAAMZGVwbG95X2Vwb2NoAAAAAQAAAAAAAAAGcGFyYW1zAAAAAAfQAAAAEURlcGxveUVwb2NoUGFyYW1zAAAAAAAAAQAAA+kAAAAEAAAH0AAAABNOb3ZhaXJlRmFjdG9yeUVycm9yAA==",
        "AAAAAAAAAAAAAAAMbGF0ZXN0X2Vwb2NoAAAAAAAAAAEAAAPpAAAH0AAAAAtFcG9jaFJlY29yZAAAAAfQAAAAE05vdmFpcmVGYWN0b3J5RXJyb3IA",
        "AAAAAQAAAAAAAAAAAAAAC0Vwb2NoUmVjb3JkAAAAAA0AAAAAAAAAEWRlcGxveW1lbnRfbGVkZ2VyAAAAAAAABAAAAAAAAAAIZXBvY2hfaWQAAAAEAAAAAAAAAA1pbnRlbnRfZW5naW5lAAAAAAAAEwAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAALbWFya2V0cGxhY2UAAAAAEwAAAAAAAAAPbWF0dXJpdHlfbGVkZ2VyAAAAAAQAAAAAAAAACHB0X3Rva2VuAAAAEwAAAAAAAAAPcm9sbG92ZXJfZW5naW5lAAAAABMAAAAAAAAACnN5X3dyYXBwZXIAAAAAABMAAAAAAAAACXRva2VuaXplcgAAAAAAABMAAAAAAAAABXZhdWx0AAAAAAAAEwAAAAAAAAAHdmVyc2lvbgAAAAAEAAAAAAAAAAh5dF90b2tlbgAAABM=",
        "AAAAAAAAAAAAAAAQcHJvdG9jb2xfdmVyc2lvbgAAAAAAAAABAAAABA==",
        "AAAAAQAAAAAAAAAAAAAAEURlcGxveUVwb2NoUGFyYW1zAAAAAAAADAAAAAAAAAAUZ3JhY2VfcGVyaW9kX2xlZGdlcnMAAAAEAAAAAAAAAA1pbnRlbnRfZW5naW5lAAAAAAAAEwAAAAAAAAAGa2VlcGVyAAAAAAATAAAAAAAAAAttYXJrZXRwbGFjZQAAAAATAAAAAAAAAA9tYXR1cml0eV9sZWRnZXIAAAAABAAAAAAAAAAIcHRfdG9rZW4AAAATAAAAAAAAAA9yb2xsb3Zlcl9lbmdpbmUAAAAAEwAAAAAAAAAKc3lfd3JhcHBlcgAAAAAAEwAAAAAAAAAJdG9rZW5pemVyAAAAAAAAEwAAAAAAAAAQdW5kZXJseWluZ190b2tlbgAAABMAAAAAAAAABXZhdWx0AAAAAAAAEwAAAAAAAAAIeXRfdG9rZW4AAAAT",
        "AAAABAAAAAAAAAAAAAAAE05vdmFpcmVGYWN0b3J5RXJyb3IAAAAABwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAMVW5hdXRob3JpemVkAAAAAwAAAAAAAAASRXBvY2hBbHJlYWR5RXhpc3RzAAAAAAAEAAAAAAAAAAxJbnZhbGlkRXBvY2gAAAAFAAAAAAAAAAxNYXRoT3ZlcmZsb3cAAAAGAAAAAAAAAA5TdG9yYWdlTWlzc2luZwAAAAAABw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_epoch: this.txFromJSON<Result<EpochRecord>>,
        initialize: this.txFromJSON<Result<void>>,
        epoch_count: this.txFromJSON<u32>,
        deploy_epoch: this.txFromJSON<Result<u32>>,
        latest_epoch: this.txFromJSON<Result<EpochRecord>>,
        protocol_version: this.txFromJSON<u32>
  }
}