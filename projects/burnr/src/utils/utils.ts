import { Account, LocalStorageUserAccount } from './types';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/api';

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

  export const createLocalStorageAccount = (): LocalStorageUserAccount => {
    const mnemonic = mnemonicGenerate(12);
    const pair = new Keyring({ type: 'sr25519' })
        .addFromUri(mnemonic, { name: uniqueNamesGenerator(config) }, 'sr25519');
    return {
        address: pair.address,
        name: pair.meta.name || '____ _____',
        seed: mnemonic,
        json: pair.toJson()
    }
  }