import { ApiPromise } from '@polkadot/api';
import SmoldotProvider from '../';
import westend_specs from './westend_specs';
import {logger} from '@polkadot/util';
import FsDatabase from '../FsDatabase';
import TEST_DB_PATH from '../TestDatabasePath';
import { twox } from '@polkadot/wasm-crypto';

const l = logger('smoldot-provider');

l.log('Creating a smoldot client');
const chainSpec = JSON.stringify(westend_specs());
const database = new FsDatabase(TEST_DB_PATH);
const provider = new SmoldotProvider(chainSpec, database);
await provider.connect();
const api = await ApiPromise.create({ provider });
l.log('API is ready');

/**
 * API Constants
 */ 
l.log('genesis hash: ', api.genesisHash.toHex());
l.log('epoch duration: ', api.consts.babe.epochDuration.toNumber());
l.log('balance required to prevent an account from being deleted: ' , api.consts.balances.existentialDeposit.toHuman());

/**
 * Basic Queries
 */ 
const ADDR = '5FHyraDcRvSYCoSrhe8LiBLdKmuL9ptZ5tEtAtqfKfeHxA4y';
const now = await api.query.timestamp.now();
const { nonce, data: balance } = await api.query.system.account(ADDR);
l.log(`balance of ${balance.free} and a nonce of ${nonce}`);