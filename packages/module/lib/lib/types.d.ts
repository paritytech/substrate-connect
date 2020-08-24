/**
 * A simple interface to communicate via JSONRPC with the WASM light client.
 */
export interface WasmRpcClient {
    /**
     * Destroy the WASM light client.
     */
    free(): void;
    /**
     * Allows starting an RPC request. Returns a `Promise` containing the result of that request.
     * @param rpc - The JSONRPC request to send
     */
    rpcSend(rpc: string): Promise<string>;
    /**
     * Subscribes to an RPC pubsub endpoint.
     *
     * @param rpc - The RPC request for subscribing.
     * @param callback - The callback of the subscribe.
     */
    rpcSubscribe(rpc: string, callback: (res: string) => void): void;
}
/**
 * An interface representing a light client compiled to WASM, along with some
 * metadata.
 */
export interface LightClient {
    /**
     * An identifier for the light client.
     */
    name: string;
    /**
     * Start running the light client.
     */
    startClient(): Promise<WasmRpcClient>;
    /**
     * A version for the light client.
     */
    version: string;
}
export interface ClientConfig {
    /**
     * An identifier for the light client.
     */
    name: string;
    /**
     * A version for the light client.
     */
    version: string;
    /**
     * The path to the chain_spec genesis config file
     */
    spec_path: string;
    /**
   * The path to the compiled wasm light client
   */
    client: string;
}
