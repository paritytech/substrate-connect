import { ApiPromise } from '@polkadot/api';
import { Account, LocalStorageAccountCtx } from './types';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import { formatBalance } from '@polkadot/util';
import type { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { ALL_PROVIDERS } from './constants';

const keyring = new Keyring({ type: 'sr25519' });

const config: Config = {
  dictionaries: [starWars]
}

export const getName = (account: Account): string => `${account.name}`;

export const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}

export const downloadFile = (fileName: string, data: string, type: string): void => {
    const anchor = window.document.createElement('a');
    anchor.href = window.URL.createObjectURL(
        new Blob(
            [data],
            { type: `application/${type}` }
        )
    );
    anchor.download = `${type === 'txt' ? 'seedphrase-' : ''}${fileName}.${type}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(anchor.href);
  }

  export const createLocalStorageAccount = (): LocalStorageAccountCtx => {
    const mnemonic = mnemonicGenerate(12);
    const pair = keyring.addFromMnemonic(mnemonic, { name: uniqueNamesGenerator(config) }, 'sr25519');
    return {
        userAddress: pair.address,
        userName: pair.meta.name as string || '____ _____',
        userSeed: mnemonic,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        userJson: pair.toJson as unknown as KeyringPair$Json,
        userHistory: []
    }
  }

  export const isEmpty = (obj: unknown): boolean => ((typeof obj === 'object' && obj !== null) && Object.keys(obj).length === 0 && obj.constructor === Object)

  export const copyToClipboard = (text: string): void => {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

export const getKeyring = (): Keyring => keyring;

export const transformCurrency = (currencyLevel: string, currency: string): string =>
    (currencyLevel !== '-') ? currencyLevel.concat(currency) : currency;

export const isValidAddressPolkadotAddress = (address = ''): boolean => {
  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address.toString())
        : decodeAddress(address)
    );

    return true;
  } catch (error) {
    return false;
  }
};

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

export const humanReadable = (amnt: number, api: ApiPromise): string => (amnt/Math.pow(10, api.registry.chainDecimals[0])).toFixed(4);

export const validateLocalstorage = (): void => {
  // expected acceptable values of localStorage.
  // Add type info to avoid having to cast
  const expectedValues: Record<string, string[]> = {
    "theme": ["true", "false"],
    "balanceVisibility": ["true", "false"],
    "endpoint": [ ALL_PROVIDERS.network ] // now an array although we don't even really need this in storage any more
  };

  Object.keys(expectedValues).forEach(key => {
    if (!Object.keys(localStorage).includes(key)) { 
      return;
    }
    
    if (!expectedValues[key].includes(localStorage[key])) {
      localStorage.removeItem(key);
    }
  });
}
