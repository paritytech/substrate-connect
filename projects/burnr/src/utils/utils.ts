import { Account, LocalStorageAccountCtx } from './types';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';
import { KeyringPair$Json } from '@polkadot/keyring/types';

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
