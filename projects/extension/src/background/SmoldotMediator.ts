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

  sendRpcMessage(message: JsonRpcRequest): number {
    const nextID = ++this.#id;
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    message.id = nextID;
    this.#smoldotClient.send_json_rpc(JSON.stringify(message));
    return nextID;
  }
}
