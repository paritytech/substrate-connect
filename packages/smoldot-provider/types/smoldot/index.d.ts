// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface SmoldotClient {
  json_rpc_send(rpc: string): void;
}

export interface SmoldotOptions {
  chain_spec: string;
  json_rpc_callback: (response: string) => void;
}

export interface Smoldot {
  start(options: SmoldotOptions): Promise<SmoldotClient>;
}

export var smoldot: Smoldot;

export default smoldot;