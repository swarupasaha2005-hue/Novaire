import { contract } from "@stellar/stellar-sdk";

const r = new contract.Ok(100n);
console.log(typeof r);
console.log(typeof r.unwrap);
console.log(r.unwrap());
console.log(Object.keys(r));
