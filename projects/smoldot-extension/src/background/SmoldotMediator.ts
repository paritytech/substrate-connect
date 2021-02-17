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

  sendRpcMessage(message: any) {
    const nextID = ++this.#id;
    message.id = nextID;
    this.#smoldot.send_json_rpc(JSON.stringify(message));
    return nextID;
  }
}
