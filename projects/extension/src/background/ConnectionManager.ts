/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as smoldot from 'smoldot';
import { AppMediator } from './AppMediator';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcResponse, JsonRpcRequest, ConnectionManagerInterface } from './types';
import EventEmitter from 'eventemitter3';
import { StateEmitter } from './types';

interface NetworkState {
  name: string;
}

interface AppState {
  name: string;
  tabId: number;
  networks: NetworkState[];
}
interface State {
  apps: AppState[];
}

export class ConnectionManager extends (EventEmitter as { new(): StateEmitter }) implements ConnectionManagerInterface {
  readonly #smoldots: SmoldotMediator[] = [];
  readonly #apps:  AppMediator[] = [];
  smoldotLogLevel = 3;

  get registeredApps(): string[] {
    return this.#apps.map(a => a.name);
  }

  get registeredClients(): string[] {
    return this.#smoldots.map(s => s.name);
  }

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
      a.networks.push({ name: app.smoldotName as string });
      return result;
    }, state);
  }

  addApp(port: chrome.runtime.Port): void {
    const app = this.#apps.find(s => s.name === port.name);

    if (app) {
      port.postMessage({ type: 'info', payload: `App ${port.name} already exists.` });
    } else {
      const newApp = new AppMediator(port, this as ConnectionManagerInterface)
      this.#apps.push(newApp);
      newApp.on('stateChanged', () => this.emit('stateChanged'));
      this.emit('stateChanged');
    }
  }

  hasClientFor(name: string): boolean {
    return this.#smoldots.find(s => s.name === name) !== undefined;
  }

  sendRpcMessageTo(name: string, message: JsonRpcRequest): number {
    const sm = this.#smoldots.find(s => s.name === name);
    if (!sm) {
      throw new Error(`No smoldot client named ${name}`);
    }
    return sm.sendRpcMessage(message);
  }

  registerApp(app: AppMediator, smoldotName: string): void {
    const sm = this.#smoldots.find(s => s.name === smoldotName);
    if (!sm) {
      throw new Error('Tried to add app to smoldot that does not exist.');
    }
    sm.addApp(app);
  }

  unregisterApp(app: AppMediator, smoldotName: string): void {
    const sm = this.#smoldots.find(s => s.name === smoldotName);
    if (!sm) {
      throw new Error('Tried to remove an app from smoldot that does not exist.');
    }

    sm.removeApp(app);
    const idx = this.#apps.findIndex(a => a.name === app.name);
    this.#apps.splice(idx, 1);
    this.emit('stateChanged');
  }


  async addSmoldot(name: string,  chainSpec: string): Promise<void> {
    if (this.#smoldots.find(s => s.name === name)) {
      throw new Error(`Extension already has a smoldot client named ${name}`);
    }

    try {
      // TODO(rem): fix the typescript definition in smoldot
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const sc = await (smoldot as any).start({
        chain_spec: chainSpec,
        max_log_level: this.smoldotLogLevel,
        json_rpc_callback: (message: string) => {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    } catch (err) {
      console.error('Error starting smoldot', err);
    }
  }

  shutdown(): void {
    for (const sm of this.#smoldots) {
      sm.smoldotClient.terminate();
    }
  }
}
