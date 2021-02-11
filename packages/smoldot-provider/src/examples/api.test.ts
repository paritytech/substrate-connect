import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import anyTest, {TestInterface} from 'ava';
import { ApiPromise } from '@polkadot/api';
import {SmoldotProvider} from '../';
import {logger} from '@polkadot/util';
import { FsDatabase } from '../FsDatabase';

// polyfill for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const l = logger('examples');

const test = anyTest as TestInterface<{api: ApiPromise}>;

test.before('Create a smoldot client', async t => {
  const chainSpec = await readFile(join(__dirname, 'westend.json'), 'utf-8');
  const database = new FsDatabase('test');
  const provider = new SmoldotProvider(chainSpec, database);
  await provider.connect();
  t.context.api = await ApiPromise.create({ provider });
  l.log('API is ready');
  t.truthy(t.context.api);
});

test('API constants', async t => {
  const api = t.context.api;
  const genesisHash = api.genesisHash.toHex();
  l.log('genesis hash: ', genesisHash);
  t.not(genesisHash, '');
  const epochDuration = api.consts.babe.epochDuration.toNumber();
  l.log('epoch duration: ', epochDuration);
  t.true(epochDuration > 0);
  const existentialDeposit = api.consts.balances.existentialDeposit.toHuman();
  l.log('existentialDeposit' , existentialDeposit);
  t.not(genesisHash, '');
});

// This errors and error handling isnt yet implemented for storage queries
// in smoldot: https://github.com/paritytech/smoldot/issues/388
test.skip('State queries', async t => {
  const api = t.context.api;
  const testAddress = '5FHyraDcRvSYCoSrhe8LiBLdKmuL9ptZ5tEtAtqfKfeHxA4y';
  const now = await api.query.timestamp.now();
  const { nonce, data: balance } = await api.query.system.account(testAddress);
  l.log(`balance of ${balance.free} and a nonce of ${nonce}`);
  t.pass();
});

test('RPC queries', async t => {
  const api = t.context.api;
  const chain = await api.rpc.system.chain();
  const lastHeader = await api.rpc.chain.getHeader();
  l.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
  t.pass();
});

test('RPC query subscriptions', async t=> {
  const api = t.context.api;
  const chain = await api.rpc.system.chain();

  return new Promise<void>((resolve, reject) => {
    let unsubscribe: any = undefined;
    return api.rpc.chain.subscribeNewHeads((lastHeader) => {
      l.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
      unsubscribe();
      t.pass();
      resolve();
    }).then(cb => {
        unsubscribe = cb;
    });
  });
});
