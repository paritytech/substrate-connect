# @substrate/light-client-extension-helpers

## Components

- **backgroundHelper**: Manages the core logic running in the background, including Smoldot instance registration, chain synchronization, active connections, and communication with the content script.
- **contentScriptHelper**: Handles communication between the tab's webpage and the extension's background script.
- **webPageHelper**: Provides an interface for the tab’s webpage to interact with the extension.
- **extensionPagesHelper**: A set of functions to manage persisted chains, connections, and boot-nodes within the extension page.
- **smoldot**: A thin abstraction over [smoldot](https://github.com/smol-dot/smoldot) package that includes a `restart` method for the smoldot client

## Example Usage

### backgroundHelper

The module exposes a `register` function that is meant to be called in your background
script. It does all the heavy lifting to manage your extension's connection to smoldot.

#### How You Can Use It

```ts
import { register } from "@substrate/light-client-extension-helpers/background"

const { lightClientPageHelper, addOnAddChainByUserListener } = register({
  smoldotClient: start({ maxLogLevel: 4 }),
  getWellKnownChainSpecs: () =>
    // these well known chains will be connected to when the extension is
    // started and their connection will always be maintained. The location
    // of these chainspecs is relative to your `assets` directory.
    Promise.all(
      [
        "./chainspecs/polkadot.json",
        "./chainspecs/ksmcc3.json",
        "./chainspecs/westend2.json",
      ].map((path) =>
        fetch(chrome.runtime.getURL(path)).then((response) => response.text()),
      ),
    ),
})

addOnAddChainByUserListener(async (inputChain) => {
  // listen for chain updates
})
```

### contentScriptHelper

This module exposes a register function that should be called in your content
script. Once registered you can access the light client provider in your `inpage`
script.

This is useful if you are implementing the [`@substrate/discovery` protocol](../discovery)

#### How You Can Use It

```ts
// constants.ts
export const CHANNEL_ID = "substrate-wallet-template"
```

```ts
// content/index.ts
import { register } from "@substrate/light-client-extension-helpers/content-script"
import { CHANNEL_ID } from "../constants"

register(CHANNEL_ID)
```

```ts
// inpage/index.ts
const provider = getLightClientProvider(CHANNEL_ID)
```

### webPageHelper

The webpage helper allows any dapp to discover the light client provider that
was registered using the `contentScriptHelper`. However this functionality
has been superseded by the [discovery protocol](../discovery).

#### How You Can Use It

```ts
// use-provider.ts
import {
  type LightClientProvider,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"
import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"

const providers = new Map<string, Promise<LightClientProvider>>()

export const useLightClientProvider = (channelId: string) => {
  const [provider, setProvider] = useState<LightClientProvider>()
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!providers.has(channelId))
      providers.set(channelId, getLightClientProvider(channelId))
    providers.get(channelId)?.then((provider) => {
      if (!isMounted()) return
      setProvider(provider)
    })
  }, [channelId, isMounted])

  return { provider }
}
```

### extensionPagesHelper

The extension page helper is conceptually the same as the web page helper,
except it is used in the user interface of your extension. By importing `helper`,
you can access light client functionality

#### How You Can Use It

Get and set the bootnodes

```ts
const getBootNodes = async (chainId: string) =>
  (await helper.getChains()).find(
    ({ genesisHash }) => genesisHash === wellKnownGenesisHashByChainId[chainId],
  )?.bootNodes ?? []

const setBootNodes = async (chainId: string, bootNodes: string[]) =>
  helper.setBootNodes(wellKnownGenesisHashByChainId[chainId], bootNodes)
```

Decode call data

```ts
import { getObservableClient } from "@polkadot-api/observable-client"
import { getViewBuilder } from "@polkadot-api/view-builder"
import { createClient } from "@polkadot-api/substrate-client"
import { helper } from "@substrate/light-client-extension-helpers/extension-page"
import { filter, firstValueFrom } from "rxjs"

export const decodeCallData = async (chainId: string, callData: string) => {
  const chains = await helper.getChains()
  const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
  if (!chain) throw new Error("unknown chain")
  const client = getObservableClient(createClient(chain.provider))
  const { metadata$, unfollow } = client.chainHead$()
  try {
    const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
    return getViewBuilder(metadata).callDecoder(callData)
  } finally {
    unfollow()
    client.destroy()
  }
}
```

### smoldot

The `smoldot` package is a streamlined version of the original
[smoldot package](https://github.com/smol-dot/smoldot). Here are the key
differences:

1. **Restarts**

   The `smoldot` client now includes a `restart` method. This is useful for
   restarting `smoldot` if it unexpectedly crashes, allowing you to quickly
   fire up a new instance.

2. **Modified Add Chain Options**

   When `smoldot` restarts, all prior connections made with `client.addChain`
   are lost. To address this, the `AddChainOptions` has been modified. The
   `potentialRelayChains` parameter is now a recursive `AddChainOptions` array
   instead of a `Chain` array. This ensures that when `smoldot` restarts and
   you need to call `addChain` to reconnect a parachain, the associated
   relaychain is always reconnected first.

3. **Supervision**

   This module also provides a `supervise` method, which checks the health of
   `smoldot` and automatically invokes the `restart` method if it detects an
   issue. It does this by repeatedly calling `addChain` with an empty string as
   the chainspec parameter. If `addChain` throws an error that isn't an
   `AddChainError`, it assumes `smoldot` is unhealthy and restarts it.

---

#### How You Can Use It

```ts
import { start } from "@substrate/light-client-extension-helpers/smoldot"

// Initialize the smoldot client
const client = start()

// Add a chain
client.addChain({
  chainSpec: "...",
  potentialRelayChains: [
    {
      chainSpec: "...",
      potentialRelayChains: [], // Recursive AddChainOptions array
    },
  ],
})

supervise(client, { onError: console.error })

// Supervise the client
client.supervise()
```
