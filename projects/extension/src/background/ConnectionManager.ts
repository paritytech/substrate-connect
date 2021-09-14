/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as smoldot from '@substrate/smoldot-light';
import { SmoldotJsonRpcCallback, SmoldotHealth } from '@substrate/smoldot-light';
import { AppProps, ConnectionManagerInterface } from './types';
import EventEmitter from 'eventemitter3';
import { StateEmitter, State } from './types';
import { Network } from '../types';
import { logger } from '@polkadot/util';
import { MessageFromManager, MessageToManager } from '@substrate/connect-extension-protocol';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import polkadot from '../../public/assets/polkadot.json';

const l = logger('Extension Connection Manager');

type RelayType = Map<string, string>;

export const relayChains: RelayType = new Map<string, string>([
  ['polkadot', JSON.stringify(polkadot)],
  ['kusama', JSON.stringify(kusama)],
  ['westend', JSON.stringify(westend)]
])

/**
 * ConnectionManager is the main class involved in managing connections from
 * apps.  It keeps track of apps and it is also responsible for triggering 
 * events when the state changes for the UI to update accordingly. 
 */
export class ConnectionManager extends (EventEmitter as { new(): StateEmitter }) implements ConnectionManagerInterface {
  readonly #apps: AppProps[] = [];
  #client: smoldot.SmoldotClient | undefined = undefined;
  #networks: Network[] = [];
  smoldotLogLevel = 3;
  #pendingRequests: string[] = [];
  #chainId = 0;

  /** registeredApps
   *
   * @returns a list of the names of apps that are currently connected
   */
  get registeredApps(): string[] {
    return this.#apps.map(a => a.name);
  }

  /** registeredClients
   *
   * @returns a list of the networks that are currently connected
   */
  get registeredClients(): string[] {
    return this.#networks.map(s => s.name);
  }

  /**
   * apps
   *
   * @returns all the connected apps.
   */
  get apps(): AppProps[] {
    return this.#apps;
  }

  /**
   * networks
   *
   * @returns all the connected networks
   */
  get networks(): Network[] {
    return this.#networks;
  }

  /**
   * getState
   *
   * @returns a view of the current state of the connection manager
   */
  getState(): State {
    const state: State = { apps: [] };
    return this.#apps.reduce((result, app) => {
      let a = result.apps.find(a => a.name === app.appName && a.tabId === app.tabId);
      if (a === undefined) {
        a = {
          name: app.appName,
          tabId: app.tabId,
          networks: []
        };
        result.apps.push(a);
      }
      a.networks.push({ name: app.chainName });
      return result;
    }, state);
  }

  /**
   * disconnectTab disconnects all apps connected
   * from the supplied tabId
   *
   * @param tabId - the id of the tab to disconnect
   */
  disconnectTab(tabId: number): void {
    this.#apps.filter(a => a.tabId && a.tabId === tabId).forEach(a => {
      this.disconnect(a)
    });
  }

  /**
   * disconnectAll disconnects all apps connected for all tabs
   */
  disconnectAll(): void {
    this.#apps.filter(a => a).forEach(a => this.disconnect(a));
  }

  createApp(incPort: chrome.runtime.Port): AppProps {
    const splitIdx = incPort.name.indexOf('::');
    if (splitIdx === -1) {
      const payload = `Invalid port name ${incPort.name} expected <app_name>::<chain_name>`;
      const error: MessageFromManager = { type: 'error', payload };
      incPort.postMessage(error);
      incPort.disconnect();
      throw new Error(payload);
    }
    const { name, sender } = incPort
    const appName: string = name.substr(0, splitIdx);
    const chainName: string = name.substr(splitIdx + 2, name.length);
    const tabId: number = sender?.tab?.id || -1;
    const url: string | undefined = sender?.url;
    const port: chrome.runtime.Port = incPort;
    const state = 'connected';

    const healthChecker = (smoldot as any).healthChecker();
    const app: AppProps = {
      appName,
      chainName,
      name,
      tabId,
      url,
      port,
      state,
      healthChecker
    }
    port.onMessage.addListener(this.#handleMessage);
    port.onDisconnect.addListener(() => { this.#handleDisconnect(app) });
    return app
  }

  /**
   * addApp registers a new app to be tracked by the background.
   *
   * @param port - a port for a fresh connection that was made to the background
   * by a content script.
   */
  addApp(port: chrome.runtime.Port): void {
    if (!this.#client) {
      throw new Error('Smoldot client does not exist.');
    }

    if (this.#findApp(port)) {
      port.postMessage({ type: 'error', payload: `App ${port.name} already exists.` });
      port.disconnect();
      return;
    }

    // if create an `AppMediator` throws, it has sent an error down the
    // port and disconnected it, so we should just ignore
    try {
      const app = this.createApp(port);
      this.registerApp(app);
      const appInfo = port.name.split('::');
      chrome.storage.sync.get('notifications', (s) => {
        s.notifications && chrome.notifications.create(port.name, {
          title: 'Substrate Connect',
          message: `App ${appInfo[0]} connected to ${appInfo[1]}.`,
          iconUrl: './icons/icon-32.png',
          type: 'basic'
        });
      });
    } catch (error) {
      l.error(`Error while adding chain: ${error}`);
    }
  }

  /**
   * registerApp is used to associate an app with a network
   *
   * @param app - The app
   */
   registerApp(app: AppProps): void {
    this.#apps.push(app);
    this.emit('stateChanged', this.getState());
  }

  /**
   * unregisterApp is used after an app has finished processing any unsubscribe
   * messages and disconnected to fully unregister itself.
   * It also retrieves the chain that app was connected to and calls smoldot for removal
   * 
   * @param app - The app
   */
   unregisterApp(app: AppProps): void {
    const idx = this.#apps.findIndex(a => a.name === app.name);
    this.#apps.splice(idx, 1);
    this.emit('stateChanged', this.getState());
  }

  /** shutdown shuts down the connected smoldot client. */
  shutdown(): void {
    this.#client?.terminate();
    this.#client = undefined;
  }

  /**
   * initSmoldot initializes the smoldot client.
   */
  async initSmoldot(): Promise<void> {
    try {
      this.#client = await (smoldot as any).start({
        forbidWs: true, /* suppress console warnings about insecure connections */
        maxLogLevel: this.smoldotLogLevel
      });
    } catch (err) {
      l.error(`Error while initializing smoldot: ${err}`);
    }
  }

  /**
   * addChain adds the Chain in the smoldot client
   *
   * @param name - Name of the chain
   * @param spec - ChainSpec of chain to be added
   * @param jsonRpcCallback - The jsonRpcCallback function that should be triggered
   * 
   * @returns addedChain - An the newly added chain info
   */
  async addChain(
    name: string,
    chainSpec: string,
    jsonRpcCallback: SmoldotJsonRpcCallback,
    tabId?: number): Promise<Network> {
    if (!this.#client) {
      throw new Error('Smoldot client does not exist.');
    }
    const existingNetwork = this.#networks.find(n => n.name === name && n.tabId === tabId)
    if (existingNetwork)
      return existingNetwork

    const addedChain = await this.#client.addChain({
      chainSpec,
      jsonRpcCallback,
      potentialRelayChains: this.#networks.map(net => net.chain),
    });

    const network: Network = {
      tabId: tabId || 0,
      name,
      chain: addedChain,
      status: 'connected',
      isKnown: true,
      chainspecPath: `${name}.json`
    }

    this.#networks.push(network);

    return network;
  }

  /** Handles the incoming message that contains Spec. */
  #handleSpecMessage = (msg: MessageToManager, app: AppProps): void => {
    const chainSpec: string = relayChains.has(app.chainName) ?
      (relayChains.get(app.chainName) || '') : msg.payload;

    const rpcCallback = (rpc: string) => {
      const rpcResp = app.healthChecker?.responsePassThrough(rpc);
      if (rpcResp)
        app.port.postMessage({ type: 'rpc', payload: rpcResp })
    }

    this.addChain(app.chainName, chainSpec, rpcCallback, app.tabId)
      .then(network => {
        app.chain = network.chain;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        app.healthChecker?.setSendJsonRpc(app.chain.sendJsonRpc);
        app.healthChecker?.start((health: SmoldotHealth) => {
          app.healthStatus = health;
        });
        // process any RPC requests that came in while waiting for `addChain`
        // to complete
        if (this.#pendingRequests.length > 0) {
          this.#pendingRequests.forEach(req => app.healthChecker?.sendJsonRpc(req));
          this.#pendingRequests = [];
        }
      })
      .catch(e => {
        const error: MessageFromManager = { type: 'error', payload: e.message };
        app.port.postMessage(error);
        app.port.disconnect();
        this.unregisterApp(app);
      });
  }

  #findApp (port: chrome.runtime.Port): AppProps | undefined {
    return this.#apps.find(
      a => a.name === port.name && a.tabId === port.sender?.tab?.id);
  }

  #handleMessage = (msg: MessageToManager, port: chrome.runtime.Port): void => {
    const app = this.#findApp(port);
    if (app) {
      if (msg.type !== 'rpc' && msg.type !== 'spec') {
        console.warn(`Unrecognised message type ${msg.type} received from content script`);
        return;
      }

      if (msg.type === 'spec' && app.chainName) {
        return this.#handleSpecMessage(msg, app);
      }

      if (app.chain === undefined) {
        // `addChain` hasn't resolved yet after the spec message so buffer the
        // messages to be sent when it does resolve
        this.#pendingRequests.push(msg.payload);
        return;
      }

      return app.healthChecker?.sendJsonRpc(msg.payload);
    }
  }

  /** 
   * disconnect tells the app to clean up its state and unsubscribe from any
  * active subscriptions and ultimately disconnects the communication port.
  */
  disconnect(app: AppProps): void {
    this.#handleDisconnect(app);
  }

  #handleDisconnect = (app: AppProps): void => {
    if (app.state === 'disconnected') {
      throw new Error('Cannot disconnect - already disconnected');
    }
    if (app.chain) {
      app.chain.remove();
    }
    const networkIdx = this.#networks.findIndex(n => n.tabId === app.tabId);
    if (networkIdx !== -1) {
      this.#networks.splice(networkIdx, 1);
    }

    this.unregisterApp(app);
    
    app.state = 'disconnected';
  }
}
