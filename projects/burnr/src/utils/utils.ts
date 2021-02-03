import { Account } from './types';

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