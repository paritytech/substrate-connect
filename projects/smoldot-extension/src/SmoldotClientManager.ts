import smoldot, { SmoldotClient } from 'smoldot';
import { AppMediator } from './AppMediator';

class SmoldotMediator {
  readonly name: string;
  readonly #smoldot: SmoldotClient;
  #id: number;

  sendRpcMessage(message: any) {
    const nextID = ++this.#id;
    message.id = nextID;
    this.#smoldot.send_json_rpc(JSON.stringify(message));
    return nextID;
  }

  constructor(name: string, smoldot: SmoldotClient) {
    this.name = name;
    this.#smoldot = smoldot;
    this.#id = 0;
  }
}

export class SmoldotClientManager {
  readonly #smoldots: SmoldotMediator[] = [];
  readonly #apps:  AppMediator[] = [];

  get registedApps() {
    return this.#apps.map(a => a.name);
  }

  get registeredClients() {
    return this.#smoldots.map(s => s.name);
  }

  hasClientFor(name: string) {
    return this.#smoldots.find(s => s.name) !== undefined;
  }

  #saveDatabase = (name: string, content: string) => {
    // TODO: save database in extension local storage
  }

  #loadDatabase = (name: string) => {
    // TODO: load database from extension local storage
    return '';
  }

  sendRpcMessageTo(name: string, message: any) {
    const sm = this.#smoldots.find(s => s.name === name);
    if (!sm) {
      throw new Error(`No smoldot client named ${name}`);
    }

    return sm.sendRpcMessage(message);
  }

  async addSmoldot(name: string,  chainSpec: string) {
    if (this.#smoldots.find(s => s.name == name)) {
      throw new Error(`Extension already has a smoldot client named ${name}`);
    }

    const sc = await smoldot.start({
        database_content: this.#loadDatabase(name),
        chain_spec: chainSpec,
        max_log_level: 3,
        json_rpc_callback: (message: string) => {
          const parsed = JSON.parse(message);
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

  constructor() {
    chrome.runtime.onConnect.addListener(port => {
      const { name } = port;
      this.#apps.push(new AppMediator(name, port, this));
    });
  }
}
