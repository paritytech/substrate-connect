// hack to make poladot-js work without bringing in webpack and babel
import "regenerator-runtime/runtime"

import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';

const timeElapsed = (from: number, till: number) => ((till - from)/1000).toFixed(2);

window.onload = () => {
  const timeLoad = performance.now();
  const timestampHtml = (withTime:boolean | undefined) => {
    const timestampDiv =  document.createElement('time');
    if (withTime) {
      const time = performance.now();
      timestampDiv.appendChild(document.createTextNode(
        `${new Date().toLocaleTimeString()} (${timeElapsed(timeLoad, time)}s)`
      ));
    }
    return timestampDiv
  }

  const messages = document.getElementById('messages');
  const messageHtml = (message: string, withTime?: boolean) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.appendChild(timestampHtml(withTime))
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
      throw Error('No messages container. Did you change the Html?');
    }

    messages.appendChild(message);
  }

  const error = (error: Error) => {
    displayMessage(errorHtml(error.message));
    throw error;
  };

  const log = (message: string, withTime?: boolean) => {
    displayMessage(messageHtml(message, withTime));
  }

  log(`Loading and syncing chain...`, true);

  (async () => {
    const response =  await fetch('./assets/westend.json')
    if (!response.ok) {
      error(new Error('Error downloading chain spec'));
    }

    const chainSpec =  await response.text();
    const provider = new SmoldotProvider(chainSpec);
    await provider.connect();
    try {
      const api = await ApiPromise.create({ provider })
      const header = await api.rpc.chain.getHeader()
      const chainName = await api.rpc.system.chain()

      log(`🌱 Light client ready!`, true);
      log(`${chainName} #${header.number}`);
      log(`Genesis hash is ${api.genesisHash.toHex()}`);
      log(`Epoch duration is ${api.consts.babe.epochDuration.toNumber()} blocks`);
      log(`ExistentialDeposit is ${api.consts.balances.existentialDeposit.toHuman()}`);
    } catch (error) {
        error(error);
    }

  })();
};
