import { AppMediator } from './AppMediator';
import { JsonRpcRequest } from './types';
import { SmoldotClient } from 'smoldot';

/**
 * SmoldotMediator is the class that represents and manages an instance of 
 * smoldot on behalf of the extension.
 */
export class SmoldotMediator {
  /** name is the name of the blockchain network the smoldot is connected to */
  readonly name: string;
  readonly #smoldotClient: SmoldotClient;
  readonly #apps: AppMediator[];
  #id: number;

  /**
   * @param name - the name of the blockchain network the smoldot is connected
   * to.
   * @param smoldotClient - a connected smoldot client
   */
  constructor(name: string, smoldotClient: SmoldotClient) {
    this.name = name;
    this.#smoldotClient = smoldotClient;
    this.#id = 0;
    this.#apps = [];
  }

  /** 
  * apps is all the apps that are talking to this smoldot client 
  * 
  * @remarks
  * This is used to choose which apps are asked to process incoming messages
  * from this smoldot client.
  */
  get apps(): AppMediator[] {
    return this.#apps;
  }

  /** 
  * addApp adds a new app to the apps currently talking to this smoldot client 
  *
  * @param app - the app to add
  */
  addApp(app: AppMediator): void {
    this.#apps.push(app);
  }

  /** 
  * removeApps removes an app that is disconnecting/disconnected from the 
  * apps currently talking to this smoldot
  *
  * @param app - the app to remove
  */
  removeApp(app: AppMediator): void {
    const idx = this.#apps.findIndex(a => a.name === app.name);
    this.#apps.splice(idx, 1);
  }

  /**
   * sendRpcMessage sends an RPC message on behalf of an app to this smoldot
   * client.  It switches the message id in the RPC message to the next
   * available id for this smoldot client and returns it to the app.
   *
   * @param message - the JSON RPC request to send
   * @return the id of the message actually sent
   */
  sendRpcMessage(message: JsonRpcRequest): number {
    const nextID = ++this.#id;
    message.id = nextID;
    this.#smoldotClient.sendJsonRpc(JSON.stringify(message), 0);
    return nextID;
  }

  /** shutdown stops the smoldot client */
  shutdown(): void {
    this.#smoldotClient.terminate();
  }
}
