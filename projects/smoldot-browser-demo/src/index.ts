// hack to make poladot-js work without bringing in webpack and babel
import "regenerator-runtime/runtime"

import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';

const messages = document.getElementById('messages');
const messageHtml = (message: string) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.appendChild(document.createTextNode(message));
  return messageDiv;
};

const errorHtml = (message: string) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add('error');
  messageDiv.appendChild(document.createTextNode(message));
  return messageDiv;
};

const displayMessage = (message: any) => {
  if (messages === null) {
    throw Error('No messages container.  Did you change the Html?');
  }

  messages.appendChild(message);
}

const logAndThrow = (error: Error) => {
  displayMessage(errorHtml(error.message));
  throw error;
};

const log = (message: string) => {
  displayMessage(messageHtml(message));
}

(async () => {
  const response =  await fetch('./assets/westend.json')
  if (!response.ok) {
    displayMessage(errorHtml('Error downloading chain spec'));
  }

  const chainSpec =  await response.text();
  const provider = new SmoldotProvider(chainSpec);
  await provider.connect();
  try {
    const api = await ApiPromise.create({ provider })
    displayMessage(messageHtml('Light client ready!'))
    log(`Genesis hash is ${api.genesisHash.toHex()}`);
    log(`Epoch duration is ${api.consts.babe.epochDuration.toNumber()}`);
    log(`ExistentialDeposit is ${api.consts.balances.existentialDeposit.toHuman()}`);
  } catch (error) {
      logAndThrow(error);
  }

})();

