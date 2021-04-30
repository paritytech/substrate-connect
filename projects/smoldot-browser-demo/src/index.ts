/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
// hack to make poladot-js work without bringing in webpack and babel
import "regenerator-runtime/runtime"
import { Detector }  from '@substrate/connect';
import UI, { emojis } from './view';

window.onload = () => {
  const loadTime = performance.now();
  const ui = new UI({ containerId: 'messages' }, { loadTime });
  ui.showSyncing();

  (async () => {
    try {
      const detect = new Detector('Smoldot Browser Demo');
      const api = await detect.connect('westend');

      // const api = await ApiPromise.create({ provider })
      const header = await api.rpc.chain.getHeader()
      const chainName = await api.rpc.system.chain()

      // Show chain constants - from chain spec
      ui.log(`${emojis.seedling} Light client ready`, true);
      ui.log(`${emojis.info} Connected to ${chainName}: syncing will start at block #${header.number}`);
      ui.log(`${emojis.chequeredFlag} Genesis hash is ${api.genesisHash.toHex()}`);
      ui.log(`${emojis.clock} Epoch duration is ${api.consts.babe.epochDuration.toNumber()} blocks`);
      ui.log(`${emojis.banknote} ExistentialDeposit is ${api.consts.balances.existentialDeposit.toHuman()}`);

      // Show how many peers we are syncing with
      const health = await api.rpc.system.health();
      const peers = health.peers.toNumber() === 1 ? '1 peer' : `${health.peers} peers`;
      ui.log(`${emojis.stethoscope} Chain is syncing with ${peers}`);

      // Check the state of syncing every 2s and update the syncing state message
      //
      // Resolves the first time the chain is fully synced so we can wait before
      // adding subscriptions. Carries on pinging to keep the UI consistent 
      // in case syncing stops or starts.
      const waitForChainToSync = () => {
        let resolved = false;
        return new Promise<void>((resolve, reject) => {
          setInterval(() => {
            api.rpc.system.health().then(health => {
              if (health.isSyncing.eq(false)) {
                ui.showSynced();
                if (!resolved) {
                  resolved = true;
                  resolve();
                }
              } else {
                ui.showSyncing();
              }
            }).catch(error => {
              ui.error(error);
              if (!resolved) {
                resolved = true;
                reject();
              }
            });
          }, 2000);
        });
      }

      await waitForChainToSync();
      ui.log(`${emojis.newspaper} Subscribing to new block headers`);
      await api.rpc.chain.subscribeNewHeads((lastHeader) => {
        ui.log(`${emojis.brick} New block #${lastHeader.number} has hash ${lastHeader.hash}`);
      });
    } catch (error) {
        ui.error(error);
    }

  })();
};
