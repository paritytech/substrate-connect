/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as smoldot from 'smoldot';
import { AppMediator } from './AppMediator';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcResponse, JsonRpcRequest, ConnectionManagerInterface } from './types';

export class ConnectionManager implements ConnectionManagerInterface {
  readonly #smoldots: SmoldotMediator[] = [];
  readonly #apps:  AppMediator[] = [];

  get registedApps(): string[] {
    return this.#apps.map(a => a.name);
  }

  get registeredClients(): string[] {
    return this.#smoldots.map(s => s.name);
  }


  // There are 2 bugs I know about in the background that I have fixed in my branch
  // a) The AppMediator doesnt add itself to the appropriate SmoldotMediator when it receives the associate message
  // b) The AppMediator doesnt register a subscription when it gets a subscription message
  //     manager.addApp(port, appName, data);
  addApp(port: chrome.runtime.Port, name: string, chainName: string): void {
    const app = this.#apps.find(s => s.name === name);
    const manager = this.#smoldots.find(s => s.name === chainName);

    if (!manager) {
      port.postMessage({ type: 'error', payload: 'Chain requested does not exist for this app.' })
    }
    if (app) {
      port.postMessage({ type: 'info', payload: 'App already exists.' })
    } else {
      const newApp = new AppMediator(name, port, chainName, this as ConnectionManagerInterface)
      this.#apps.push(newApp)
    }
  }

  hasClientFor(name: string): boolean {
    return this.#smoldots.find(s => s.name === name) !== undefined;
  }

  #saveDatabase = (name: string, content: string): void => {
    // not really bytws but im just using this to make the linter happy!
    console.log(`Saving ${content.length} bytes of JSON for ${name} client`);
    // TODO: save database in extension local storage
  }

  #loadDatabase = (name: string): string => {
    console.log(`Loading ${name} client database`);
    // TODO: load database from extension local storage
    return '';
  }

  sendRpcMessageTo(name: string, message: JsonRpcRequest): number {
    const sm = this.#smoldots.find(s => s.name === name);
    if (!sm) {
      throw new Error(`No smoldot client named ${name}`);
    }
    return sm.sendRpcMessage(message);
  }

  async addSmoldot(name: string,  chainSpec: string, testSmoldot?: smoldot.Smoldot): Promise<void> {
    const client = testSmoldot || smoldot;
    if (this.#smoldots.find(s => s.name === name)) {
      throw new Error(`Extension already has a smoldot client named ${name}`);
    }

    try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const sc = await client.start({
        database_content: this.#loadDatabase(name),
        chain_spec: chainSpec,
        max_log_level: 3,
        json_rpc_callback: (message: string) => {
          const parsed = JSON.parse(message) as JsonRpcResponse;
          for (const app of this.#apps) {
            if (app.processSmoldotMessage(parsed)) {
              break;
            }
          }
        },
        database_save_callback: (database_content: string) => { 
          this.#saveDatabase(name, database_content);
        }
      });

      const sm = new SmoldotMediator(name, sc);

      this.#smoldots.push(sm);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return sc;
    } catch (err) {
      console.log('Function addSmoldot error:', err);
    }
  }
}
