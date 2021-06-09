/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExtensionMessageRouter } from './ExtensionMessageRouter';
import { ExtensionPageInjector } from './ExtensionPageInjector';
import { debug } from '../utils/debug';

debug('EXTENSION CONTENT SCRIPT RUNNING');

new ExtensionPageInjector();
const router = new ExtensionMessageRouter();
router.listen();
