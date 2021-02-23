import { JsonRpcRequest } from './types';
import { SmoldotClient } from 'smoldot';

export class SmoldotMediator {
  readonly name: string;
  readonly #smoldot: SmoldotClient;
  #id: number;

  constructor(name: string, smoldot: SmoldotClient) {
    this.name = name;
    this.#smoldot = smoldot;
    this.#id = 0;
  }

  sendRpcMessage(message: JsonRpcRequest): number {
    const nextID = ++this.#id;
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    message.id = nextID;
    this.#smoldot.send_json_rpc(JSON.stringify(message));
    return nextID;
  }
}
