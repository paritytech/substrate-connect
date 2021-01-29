import { formatBalance } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';

/*
* format once with @polkadot/util formatBalance,
* then strip the trailing Unit and make it to 2 decimal points
*/
export const prettyBalance = (rawBalance: Balance | BN | number): string => {
  
  if( (typeof(rawBalance) === 'number' &&  rawBalance === 0) || !rawBalance) {
    return '0'
  } else if (rawBalance.toString() === '0'){
    return rawBalance.toString();
  }
  // Use `api.registry.chainDecimals` instead of decimals
  const firstPass = formatBalance(rawBalance,  { decimals: 12, forceUnit: '-', withSi: false });

  return firstPass.slice(0, firstPass.length - 1);
}