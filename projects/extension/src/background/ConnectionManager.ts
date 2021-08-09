/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as smoldot from 'smoldot';
import { AppMediator } from './AppMediator';
import { JsonRpcResponse, JsonRpcRequest, ConnectionManagerInterface } from './types';
import EventEmitter from 'eventemitter3';
import { StateEmitter, State } from './types';
import { Network } from '../types';
import { logger } from '@polkadot/util';

const l = logger('Extension Connection Manager');

/**
 * ConnectionManager is the main class involved in managing connections from
 * apps and smoldots.  It keeps track of apps in {@link AppMediator} instances.
 * It is also responsible for triggering events when the state changes for 
 * the UI to update accordingly. 
 *
 * The 3 classes act in concert to multiples requests from various apps to
 * smoldot clients and to clean up all an app's subscriptions when disconnected.
 */
export class ConnectionManager extends (EventEmitter as { new(): StateEmitter }) implements ConnectionManagerInterface {
  #client: smoldot.SmoldotClient | undefined = undefined;
  readonly #networks: Network[] = [];
  readonly #apps:  AppMediator[] = [];
  smoldotLogLevel = 3;
  #id = 0;

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
  get apps(): AppMediator[] {
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
      let a = result.apps.find(a => a.name === app.appName);
      if (a === undefined) {
        a = {
          name: app.appName,
          tabId: app.tabId as number,
          networks: []
        };
        result.apps.push(a);
      }
      a.networks.push({ name: app.chainName });
      return result;
    }, state);
  }

  /**
   * disconnectTab disconnects all instances of {@link AppMediator} connected
   * from the supplied tabId
   *
   * @param tabId - the id of the tab to disconnect
   */
  disconnectTab(tabId: number): void {
    this.#apps.filter(a => a.tabId && a.tabId === tabId).forEach(a => a.disconnect());
  }

  /**
   * disconnectAll disconnects all instances of {@link AppMediator} connected
   * for all tabs
   */
  disconnectAll(): void {
    this.#apps.filter(a => a).forEach(a => a.disconnect());
  }

  /**
   * addApp registers a new app to be tracked by the background.
   *
   * @param port - a port for a fresh connection that was made to the background
   * by a content script.
   */
  addApp(port: chrome.runtime.Port): void {
    let notifMsg: string;
    if (!this.#client) {
      throw new Error('Smoldot client does not exist.');
    }
    const app = this.#apps.find(s => s.name === port.name);
    if (app) {
      notifMsg = `App ${port.name} already exists.`;
      port.postMessage({ type: 'info', payload: `App ${port.name} already exists.` });
    } else {
      const newApp = new AppMediator(port, this as ConnectionManagerInterface)
      if (newApp.associate()) {
        newApp.on('stateChanged', () => this.emit('stateChanged', this.getState()));
        this.emit('stateChanged', this.getState());
        const appInfo = port.name.split('::');
        notifMsg = `App ${appInfo[0]} connected to ${appInfo[1]}.`
      }
    }
    chrome.storage.sync.get('notifications', (s) => {
      s.notifications && chrome.notifications.create('', {
        title: 'Substrate Connect',
        message: notifMsg,
        iconUrl: './icons/icon-32.png',
        type: 'basic'
      });
    });
  }

  /**
   * hasClientFor
   *
   * @param name - the name of the network.
   * @returns whether the ConnectionManager has a smoldot client for the network.
   */
  hasClientFor(name: string): boolean {
    return this.#networks.find(ch => ch.name === name) !== undefined;
  }

  /**
   * sendRpcMessageTo is used by the {@link AppMediator} instances to send an
   * RPC message to the smoldot chain.
   *
   * @param name - the name of the chain.
   * @param message - the RPC message to send.
   * @returns the actual (remapped) ID of the message that was sent.
   */
  sendRpcMessageTo(name: string, message: JsonRpcRequest): number {
    if (!this.#client) {
      throw new Error('Smoldot client does not exist.');
    }
    const c = this.#networks.filter(ch => ch.name === name);
    if (c.length === 0) {
      throw new Error(`Chain ${name} does not exist.`);
    }
    const nextID = ++this.#id;
    message.id = nextID;
    c[0].chain?.sendJsonRpc(JSON.stringify(message));
    return nextID;
  }

  /**
   * registerApp is used by the {@link AppMediator} instances to associate an
   * app with a network
   *
   * @param app - The app
   */
  registerApp(app: AppMediator): void {
    if (!this.#client) {
      throw new Error('Tried to register an app to smoldot client that does not exist.');
    }
    this.#apps.push(app);
  }

  /**
   * unregisterApp is used after an app has finished processing any unsubscribe
   * messages and disconnected to fully unregister itself.
   * It also retrieves the chain that app was connected to and calls smoldot for removal
   * 
   * @param app - The app
   */
  unregisterApp(app: AppMediator): void {
    if (!this.#client) {
      throw new Error('Tried to unregister an app to smoldot client that does not exist.');
    }
    app.chain && app.chain?.remove();
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
   */
  async addChain (name: string, spec: string): Promise<smoldot.SmoldotChain | undefined> {
    try {
      if (!this.#client) {
        throw new Error('Smoldot client does not exist.');
      }
      const addedChain = await this.#client.addChain({
        chainSpec: spec,
        jsonRpcCallback: (message: string) => {
          const parsed = JSON.parse(message) as JsonRpcResponse;
          for (const app of this.#apps) {
            app.processSmoldotMessage(parsed);
          }
        }
      });

      this.#networks.push({
        name: name,
        chain: addedChain,
        status: 'connected',
        isKnown: true,
        chainspecPath: `${name}.json`
      });

      return addedChain;
    } catch (err) {
      l.error(`Error while trying to connect to chain ${name}: ${err}`);
    }
  }
}
