import { AppMediator } from './AppMediator';
import { JsonRpcRequest } from './types';
import { SmoldotClient } from 'smoldot';

export class SmoldotMediator {
  readonly name: string;
  readonly #smoldotClient: SmoldotClient;
  readonly #apps: AppMediator[];
  #id: number;

  constructor(name: string, smoldotClient: SmoldotClient) {
    this.name = name;
    this.#smoldotClient = smoldotClient;
    this.#id = 0;
    this.#apps = [];
  }

  get apps(): AppMediator[] {
    return this.#apps;
  }

  addApp(app: AppMediator): void {
    this.#apps.push(app);
  }

  removeApp(app: AppMediator): void {
    const idx = this.#apps.findIndex(a => a.name === app.name);
    this.#apps.splice(idx, 1);
  }

  sendRpcMessage(message: JsonRpcRequest): number {
    const nextID = ++this.#id;
    message.id = nextID;
    this.#smoldotClient.sendJsonRpc(JSON.stringify(message), 0);
    return nextID;
  }

  shutdown(): void {
    this.#smoldotClient.terminate();
  }
}
