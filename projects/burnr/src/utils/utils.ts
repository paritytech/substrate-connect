import { Account, LocalStorageAccountCtx } from './types';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';

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
    // const pair = keyring.addFromUri('//Charlie', { name: 'Charlie default' });
    return {
        userAddress: pair.address,
        userName: pair.meta.name as string || '____ _____',
        userSeed: mnemonic,
        userJson: pair.toJson(),
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

export const toDecimals = (raw: number, power: number, networkDecimals: number): number =>
    raw / Math.pow(10, networkDecimals - power);

export const unitPowers = [
    { power: -24, value: 'y' },
    { power: -21, value: 'z' },
    { power: -18, value: 'a' },
    { power: -15, value: 'f' },
    { power: -12, value: 'p' },
    { power: -9, value: 'n' },
    { power: -6, value: 'µ' },
    { power: -3, value: 'm' },
    { power: 0, value: '-' },
    { power: 3, value: 'k' },
    { power: 6, value: 'M' },
    { power: 9, value: 'B' },
    { power: 12, value: 'T' },
    { power: 15, value: 'P' },
    { power: 18, value: 'E' },
    { power: 21, value: 'Z' },
    { power: 24, value: 'Y' }
]
