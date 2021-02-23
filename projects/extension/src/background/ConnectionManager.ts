import smoldot, { Smoldot } from 'smoldot';
import { AppMediator } from './AppMediator';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcResponse, ConnectionManagerInterface } from './types';

export class ConnectionManager implements ConnectionManagerInterface {
  readonly #smoldots: SmoldotMediator[] = [];
  readonly #apps:  AppMediator[] = [];

  constructor() {
    chrome.runtime.onConnect.addListener(port => {
      const { name } = port;
      this.#apps.push(new AppMediator(name, port, this));
    });
  }

  get registedApps(): string[] {
    return this.#apps.map(a => a.name);
  }

  get registeredClients(): string[] {
    return this.#smoldots.map(s => s.name);
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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  sendRpcMessageTo(name: string, message: any): number {
    const sm = this.#smoldots.find(s => s.name === name);
    if (!sm) {
      throw new Error(`No smoldot client named ${name}`);
    }

    return sm.sendRpcMessage(message);
  }

  async addSmoldot(name: string,  chainSpec: string, testSmoldot?: Smoldot): Promise<void> {
    const client = testSmoldot || smoldot;
    if (this.#smoldots.find(s => s.name == name)) {
      throw new Error(`Extension already has a smoldot client named ${name}`);
    }

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
  }
}
