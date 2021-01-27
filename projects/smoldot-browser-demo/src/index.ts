// hack to make poladot-js work without bringing in webpack and babel
import "regenerator-runtime/runtime"

import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';
import UI from './view';

const timeElapsed = (from: number, till: number) => ((till - from)/1000).toFixed(2);

window.onload = () => {
  const loadTime = performance.now();
  const ui = new UI({ containerId: 'messages' }, { loadTime });
  ui.log(`Loading and syncing chain...`, true);

  (async () => {
    const response =  await fetch('./assets/westend.json')
    if (!response.ok) {
      ui.error(new Error('Error downloading chain spec'));
    }

    const chainSpec =  await response.text();
    const provider = new SmoldotProvider(chainSpec);
    await provider.connect();
    try {
      const api = await ApiPromise.create({ provider })
      const header = await api.rpc.chain.getHeader()
      const chainName = await api.rpc.system.chain()

      ui.log(`🌱 Light client ready!`, true);
      ui.log(`${chainName} #${header.number}`);
      ui.log(`Genesis hash is ${api.genesisHash.toHex()}`);
      ui.log(`Epoch duration is ${api.consts.babe.epochDuration.toNumber()} blocks`);
      ui.log(`ExistentialDeposit is ${api.consts.balances.existentialDeposit.toHuman()}`);
    } catch (error) {
        ui.error(error);
    }

  })();
};
