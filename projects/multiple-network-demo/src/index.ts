// hack to make poladot-js work without bringing in webpack and babel
import "regenerator-runtime/runtime"
import { Detector }  from '@substrate/connect';

window.onload = () => {
  void (async () => {
    try {
      const detect = new Detector('Multiple Network Demo');

      const westend = await detect.connect('westend');
      const westendUI = document.getElementById('westend') as HTMLElement;
      const westendHead = await westend.rpc.chain.getHeader();
      westendUI.innerText = westendHead?.number.toString();
      await westend.rpc.chain.subscribeNewHeads((lastHeader) => {
        westendUI.innerText = lastHeader?.number.toString();
      });

      const kusama = await detect.connect('kusama');
      const kusamaUI = document.getElementById('kusama') as HTMLElement;
      const kusamaHead = await kusama.rpc.chain.getHeader();
      kusamaUI.innerText = kusamaHead?.number.toString();
      await kusama.rpc.chain.subscribeNewHeads((lastHeader) => {
        kusamaUI.innerText = lastHeader?.number.toString();
      });

      const polkadot = await detect.connect('polkadot');
      const polkadotUI = document.getElementById('polkadot') as HTMLElement;
      const polkadotHead = await polkadot.rpc.chain.getHeader();
      polkadotUI.innerText = polkadotHead?.number.toString();
      await polkadot.rpc.chain.subscribeNewHeads((lastHeader) => {
        polkadotUI.innerText = lastHeader?.number.toString();
      });
    } catch (error) {
        console.error(error);
    }

  })();
};
