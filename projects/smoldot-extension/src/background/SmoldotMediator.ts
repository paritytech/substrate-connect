import { SmoldotClient } from 'smoldot';

export class SmoldotMediator {
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
