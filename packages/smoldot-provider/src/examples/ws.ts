/*
 * This script is useful for comparing how the WsProvider behaves with the
 * SmoldotProvider. 
 *
 * Run a local node (any of flavour: smoldot / substrate / substrate --light)
 * and connect to it with this.
 */
import { ApiPromise, WsProvider } from '@polkadot/api';
import {logger} from '@polkadot/util';

const l = logger('smoldot-provider');

l.log('Creating a smoldot client');
const provider = new WsProvider('ws://127.0.0.1:9944/');

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

