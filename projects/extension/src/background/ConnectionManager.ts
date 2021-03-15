/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as smoldot from 'smoldot';
import { AppMediator } from './AppMediator';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcResponse, JsonRpcRequest, ConnectionManagerInterface } from './types';

export class ConnectionManager implements ConnectionManagerInterface {
  readonly #smoldots: SmoldotMediator[] = [];
  readonly #apps:  AppMediator[] = [];

  constructor() {
    chrome.runtime.onConnect.addListener(port => {
      const { name } = port;
      this.#apps.push(new AppMediator(name, port, this as ConnectionManagerInterface));
    });
  }

  get registeredApps(): string[] {
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

  sendRpcMessageTo(name: string, message: JsonRpcRequest): number {
    const sm = this.#smoldots.find(s => s.name === name);
    if (!sm) {
      throw new Error(`No smoldot client named ${name}`);
    }

    return sm.sendRpcMessage(message);
  }

  registerAppWithSmoldot(app: AppMediator, smoldotName: string): void {
    const sm = this.#smoldots.find(s => s.name === smoldotName);
    if (!sm) {
      throw new Error('Tried to add app to smoldot that does not exist.');
    }

    sm.addApp(app);
  }

  async addSmoldot(name: string,  chainSpec: string, testSmoldot?: smoldot.Smoldot): Promise<void> {
    const client = testSmoldot || smoldot;
    if (this.#smoldots.find(s => s.name == name)) {
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
          for (const app of sm.apps) {
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
    } catch (err) {
      console.log('err', err);
    }
  }
}
