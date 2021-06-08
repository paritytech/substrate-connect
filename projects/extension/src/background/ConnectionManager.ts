/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as smoldot from 'smoldot';
import { AppMediator } from './AppMediator';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcResponse, JsonRpcRequest, ConnectionManagerInterface } from './types';
import EventEmitter from 'eventemitter3';
import { StateEmitter, State } from './types';
import { Network } from '../types';

/**
 * ConnectionManager is the main class involved in managing connections from
 * apps and smoldots.  It keeps track of apps in {@link AppMediator} instances
 * and smoldot clients in {@link SmoldotMediator} instances.  It is also
 * responsible for triggering events when the state changes for the UI to update
 * accordingly. 
 *
 * The 3 classes act in concert to multiples requests from various apps to
 * smoldot clients and to clean up all an app's subscriptions when disconnected.
 */
export class ConnectionManager extends (EventEmitter as { new(): StateEmitter }) implements ConnectionManagerInterface {
  readonly #smoldots: SmoldotMediator[] = [];
  readonly #apps:  AppMediator[] = [];
  smoldotLogLevel = 3;

  readonly #networks: Network[] = [];

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
    return this.#smoldots.map(s => s.name);
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
      a.networks.push({ name: app.smoldotName });
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
    const app = this.#apps.find(s => s.name === port.name);
    if (app) {
      port.postMessage({ type: 'info', payload: `App ${port.name} already exists.` });
    } else {
      const newApp = new AppMediator(port, this as ConnectionManagerInterface)
      if (newApp.associate()) {
        this.#apps.push(newApp);
        /* TODO(nik): Test the newApp emit based on the quote: "we actually dont ever emit the stateChanged 
        ** even in the AppMediator any more ... I removed that when I removed the associate message:
        ** https://github.com/paritytech/substrate-connect/pull/254
        ** so maybe we can simplify by not having the AppMediator emit any events
        */
        newApp.on('stateChanged', () => this.emit('stateChanged', this.getState()));
        this.emit('stateChanged', this.getState());
      }
    }
  }

  /**
   * hasClientFor
   *
   * @param name - the name of the network.
   * @returns whether the ConnectionManager has a smoldot client for the network.
   */
  hasClientFor(name: string): boolean {
    return this.#smoldots.find(s => s.name === name) !== undefined;
  }

  /**
   * sendRpcMessageTo is used by the {@link AppMediator} instances to send an
   * RPC message to a smoldot client.
   *
   * @param name - the name of the network.
   * @param message - the RPC message to send.
   * @returns the actual (remapped) ID of the message that was sent.
   */
  sendRpcMessageTo(name: string, message: JsonRpcRequest): number {
    const sm = this.#smoldots.find(s => s.name === name);
    if (!sm) {
      throw new Error(`No smoldot client named ${name}`);
    }
    return sm.sendRpcMessage(message);
  }

  /**
   * registerApp is used by the {@link AppMediator} instances to associate an
   * app with a network
   *
   * @param app - The app
   * @param smoldotName - The name of the network
   */
  registerApp(app: AppMediator, smoldotName: string): void {
    const sm = this.#smoldots.find(s => s.name === smoldotName);
    if (!sm) {
      throw new Error('Tried to add app to smoldot that does not exist.');
    }
    sm.addApp(app);
  }

  /**
   * unregisterApp is used after an app has finished processing any unsubscribe
   * messages and disconnected to fully unregister itself.
   *
   * @param app - The app
   * @param smoldotName - The name of the network the app was connected to.
   */
  unregisterApp(app: AppMediator, smoldotName: string): void {
    const sm = this.#smoldots.find(s => s.name === smoldotName);
    if (!sm) {
      throw new Error('Tried to remove an app from smoldot that does not exist.');
    }

    sm.removeApp(app);
    const idx = this.#apps.findIndex(a => a.name === app.name);
    this.#apps.splice(idx, 1);
    this.emit('stateChanged', this.getState());
  }


  /**
   * addSmoldot connects and adds a new smoldot client.
   *
   * @param name - The name of the network.
   * @param chainSpec - The chain spec for the network.
   * @returns a Promise
   */
  async addSmoldot(name: string,  chainSpec: string): Promise<void> {
    if (this.#smoldots.find(s => s.name === name)) {
      throw new Error(`Extension already has a smoldot client named ${name}`);
    }

    try {
      // TODO(rem): fix the typescript definition in smoldot
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const sc = await (smoldot as any).start({
        chainSpecs: [chainSpec],
        maxLogLevel: this.smoldotLogLevel,
        jsonRpcCallback: (message: string) => {
          const parsed = JSON.parse(message) as JsonRpcResponse;
          for (const app of sm.apps) {
            if (app.processSmoldotMessage(parsed)) {
              break;
            }
          }
        }
      });

      const sm = new SmoldotMediator(name, sc);

      this.#smoldots.push(sm);
      //  temp solution until correct mapping takes place
      // TODO: fix this when mapping is corrected
      this.#networks.push({
        name: name,
        status: 'connected',
        isKnown: true,
        chainspecPath: `${name}.json`
      });
    } catch (err) {
      console.error('Error starting smoldot', err);
    }
  }

  /** shutdown shuts down all the connected smoldot clients. */
  shutdown(): void {
    for (const sm of this.#smoldots) {
      sm.shutdown();
    }
  }
}
