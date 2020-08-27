import { ProviderInterface, ProviderInterfaceCallback, ProviderInterfaceEmitCb, ProviderInterfaceEmitted } from '@polkadot/rpc-provider/types';
import { LightClient } from './types';
interface SubscriptionHandler {
    callback: ProviderInterfaceCallback;
    type: string;
}
export declare class WasmProvider implements ProviderInterface {
    #private;
    readonly light: LightClient;
    constructor(light: LightClient);
    /**
     * @summary `true` when this provider supports subscriptions
     */
    get hasSubscriptions(): boolean;
    /**
     * @description Returns a clone of the object
     */
    clone(): WasmProvider;
    connect(): void;
    /**
     * @description Manually disconnect from the connection.
     */
    disconnect(): void;
    /**
     * @summary Whether the node is connected or not.
     * @return {boolean} true if connected
     */
    isConnected(): boolean;
    /**
     * @summary Listens on events after having subscribed using the [[subscribe]] function.
     * @param type - Event
     * @param sub - Callback
     */
    on(type: ProviderInterfaceEmitted, sub: ProviderInterfaceEmitCb): () => void;
    /**
     * @summary Send JSON data using WebSockets to the wasm node.
     * @param method The RPC methods to execute
     * @param params Encoded paramaters as appliucable for the method
     * @param subscription Subscription details (internally used)
     */
    send(method: string, params: any[], subscription?: SubscriptionHandler): Promise<any>;
    /**
     * @name subscribe
     * @summary Allows subscribing to a specific event.
     * @param  {string}                     type     Subscription type
     * @param  {string}                     method   Subscription method
     * @param  {any[]}                 params   Parameters
     * @param  {ProviderInterfaceCallback} callback Callback
     * @return {Promise<number>}                     Promise resolving to the dd of the subscription you can use with [[unsubscribe]].
     *
     * @example
     * <BR>
     *
     * ```javascript
     * const provider = new WasmProvider(client);
     * const rpc = new Rpc(provider);
     *
     * rpc.state.subscribeStorage([[storage.balances.freeBalance, <Address>]], (_, values) => {
     *   console.log(values)
     * }).then((subscriptionId) => {
     *   console.log('balance changes subscription id: ', subscriptionId)
     * })
     * ```
     */
    subscribe(type: string, method: string, params: any[], callback: ProviderInterfaceCallback): Promise<number>;
    /**
     * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
     */
    unsubscribe(_type: string, method: string, id: number): Promise<boolean>;
    private emit;
}
export {};
