/**
 * The substrate-connect package makes it possible to connect to Substrate-compatible blockchains.
 *
 * Connecting to a chain is done in two steps:
 *
 * 1. Call {createScClient} or {createPolkadotJsScClient}, which gives you a so-called *client*.
 * 2. Call `addChain` or `addWellKnownChain` on this client.
 *
 * Use {createPolkadotJsScClient} if you want to bind the PolkadotJS library to substrate-connect.
 * This client will provide chains that implement the `ProviderInterface` interface defined in the
 * `@polkadot/api` NPM package. These chains can be passed to `ApiPromise.create`, and you can
 * then use the PolkadotJS library as you normally would. See <https://polkadot.js.org/docs>.
 *
 * Use {createScClient} if you are interested in a lower-level experience where you directly
 * send JSON-RPC requests and receive responses.
 * In the library's internals, {createPolkadotJsScClient} is implemented on top of
 * {createScClient}.
 *
 * If you use {createPolkadotJsScClient}, be aware that the PolkadotJS library and its API are
 * fundamentally built around full nodes functionnalities, while substrate-connect is a light
 * client. Some functionnalities of PolkadotJS will not work properly, and/or not as well as they
 * could. This is fundamentally not fixable, and, while {createPolkadotJsScClient} is acceptable
 * for demos and prototypes, it is not possible to achieve the best user experience by using
 * PolkadotJS. Proper light-client-oriented high-level libraries built on top of
 * {createScClient} are currently in development.
 * 
 * # Security concern
 *
 * As an important note - a light client only verifies the authenticity of blocks, but not their
 * correctness. For this reason, the block that is reported as being the best block might be
 * incorrect. In the context of a light client, only the finalised block can be assumed
 * to be correct. Consequently, accessing the storage of any non-finalised block is also
 * not guaranteed to report correct values. This security concerni is mostly relevant
 * to PolkadotJS, as PolkadotJS assumes best block by default.

 *
 * # Adding parachains
 *
 * Connecting to a parachain is done the same way as connecting to a standalone chain: obtaining
 * a client (with {createScClient} or {createPolkadotJsScClient}) then calling `addChain`.
 *
 * However, if you call `addChain` with a parachain chain specification, you **must** have
 * connected to its corresponding relay chain beforehand (using `addChain` or `addWellKnownChain`).
 * Failing to do so will lead to an error at the initialization of the parachain.
 *
 * Furthermore, the parachain must be added to the same client object as the one the relay chain
 * was added to.
 *
 * In other words, this will work:
 *
 * ```js
 * const client = createScClient();
 * await client.addChain(relayChain);
 * await client.addChain(parachain);
 * ```
 *
 * While this will **not** work, and an exception will be thrown when adding the parachain:
 *
 * ```js
 * await createScClient().addChain(relayChain);
 * await createScClient().addChain(parachain);
 * ```
 *
 * # Resources sharing
 *
 * While calling {createScClient} or {createPolkadotJsScClient} multiple times leads to a
 * different observable behaviour when it comes to parachains (see previous section), internally
 * resources are shared between all the clients.
 *
 * In order words, it is not a problem to do this:
 *
 * ```js
 * const relayChain = ...;
 * const chain1 = await createScClient().addChain(relayChain);
 * const chain2 = await createScClient().addChain(relayChain);
 * ```
 *
 * From an API perspective, `chain1` and `chain2` should be treated as two completely separate
 * connections to the same chain. Internally, however, only one "actual" connection to that chain
 * will exist.
 *
 * This means that there is no problem in calling {createScClient} or
 * {createPolkadotJsScClient} from within a library for example.
 *
 * # Well-known chains
 *
 * This package contains a list of so-called {WellKnownChain}s. This is a list of popular chains
 * that users are likely to connect to. Instead of calling `addChain` with a chain specification,
 * one can call `addWellKnownChain`, passing only the name of a well-known chain as parameter.
 *
 * Using {WellKnownChain}s doesn't provide any benefit when the substrate-connect extension is not
 * installed.
 *
 * If, however, the substrate-connect extension is installed, using {addWellKnownChain} has several
 * benefits:
 *
 * - The web page that uses substrate-connect doesn't need to download the chain specification of
 * a well-known chain from the web server, as this chain specification is already known by the
 * extension.
 * - The extension starts connect to well-known chains when the browser initializes, meaning that
 * when `addWellKnownChain` is called, it is likely that the chain in question has already been
 * fully synchronized.
 * - Furthermore, the extension stores the state of all the well-known chains in the browser's
 * local storage. This leads to a very quick initialization time.
 *
 * @packageDocumentation
 */

export { WellKnownChain } from "./WellKnownChain.js"
export * from "./connector/index.js"
export * from "./createPolkadotJsScClient/index.js"
