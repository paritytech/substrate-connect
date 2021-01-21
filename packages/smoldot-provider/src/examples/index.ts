import { ApiPromise } from '@polkadot/api';
import SmoldotProvider from '../';
import westend_specs from './westend_specs';

console.log('Loading chain spec');
const chainSpec = JSON.stringify(westend_specs());
console.log('Creating provider');
const provider = new SmoldotProvider(chainSpec);
console.log('Connecting provider');
await provider.connect();
console.log('Creating API wrapper');
const api = await ApiPromise.create({ provider });
console.log('Done');
