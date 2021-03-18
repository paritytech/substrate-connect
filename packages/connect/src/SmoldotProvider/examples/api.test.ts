/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import expect from 'expect';
import { ApiPromise } from '@polkadot/api';
import {SmoldotProvider} from '../';
import {logger} from '@polkadot/util';
import { FsDatabase } from '../FsDatabase';
import westend from './westend.json';

const l = logger('examples');
let api: ApiPromise;

describe('API integration tests', () => {
    const getApi = async () => {
    const chainSpec = JSON.stringify(westend);
    const database = new FsDatabase('test');
    const provider = new SmoldotProvider(chainSpec, database);
    await provider.connect();
    return await ApiPromise.create({ provider });
    l.log('API is ready');
    expect(api).toBeTruthy();
  };

  it('API constants', async () => {
    const api = await getApi();
    const genesisHash = api.genesisHash.toHex();
    l.log('genesis hash: ', genesisHash);
    expect(genesisHash).not.toBe('');
    const epochDuration = api.consts.babe.epochDuration.toNumber();
    l.log('epoch duration: ', epochDuration);
    expect(epochDuration > 0).toBe(true);
    const existentialDeposit = api.consts.balances.existentialDeposit.toHuman();
    l.log('existentialDeposit' , existentialDeposit);
    expect(genesisHash).not.toBe('');
  });

  // This errors and error handling isnt yet implemented for storage queries
  // in smoldot: https://github.com/paritytech/smoldot/issues/388
  it.skip('State queries', async () => {
    const api = await getApi();
    const testAddress = '5FHyraDcRvSYCoSrhe8LiBLdKmuL9ptZ5tEtAtqfKfeHxA4y';
    const { nonce, data: balance } = await api.query.system.account(testAddress);
    l.log(`balance of ${balance.free} and a nonce of ${nonce}`);
  }, 10000);

  it('RPC queries', async () => {
    const api = await getApi();
    const chain = await api.rpc.system.chain();
    const lastHeader = await api.rpc.chain.getHeader();
    l.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
  }, 10000);

  it('RPC query subscriptions', async () => {
    const api = await getApi();
    const chain = await api.rpc.system.chain();
    return new Promise<void>((resolve) => {
      let unsubscribe: any = undefined;
      api.rpc.chain.subscribeNewHeads((lastHeader) => {
        l.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
        unsubscribe();
        resolve();
      }).then(cb => {
          unsubscribe = cb;
      });
    });
  }, 10000);
});
