import { Client } from './packages/bindings/yt_token/src/index';

const resultClassLike = {
  unwrap: () => { return 0n; },
  isOk: () => true,
  isErr: () => false
};

const claimableTx = {
  result: resultClassLike
};

let rawClaimable: any = claimableTx.result;
if (typeof rawClaimable === 'object' && rawClaimable !== null) {
  if (typeof rawClaimable.unwrap === 'function') rawClaimable = rawClaimable.unwrap();
  else if ('ok' in rawClaimable) rawClaimable = rawClaimable.ok;
  else if ('value' in rawClaimable) rawClaimable = rawClaimable.value;
}

const parsedClaimable = Number(rawClaimable);
console.log("Raw Claimable:", rawClaimable);
console.log("Typeof rawClaimable:", typeof rawClaimable);
console.log("Parsed:", parsedClaimable);
console.log("Parsed > 0:", parsedClaimable > 0);
