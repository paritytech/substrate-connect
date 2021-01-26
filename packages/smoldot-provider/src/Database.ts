import * as pkg from '../package.json';

// REM: Don't know how to make typescript happy. This doesn't work: // let create: (name: string) => Database | undefined = undefined;
let create: any = undefined;

// We dont want to force our users into webpack5 / babel
// This IIFE simulates top level await in the browser
// https://github.com/tc39/proposal-top-level-await
(async () => {
  let db: any;

  if (typeof window === 'object') {
    db  = await import('./BrowserDatabase');
  } else {
    db  = await import('./FsDatabase');
  }

  create = db.create;
})();


/**
 * @name Database
 *
 * @description `Database` defines the operations needed for managing the
 * chain state for the smoldot WASM light client.
 */
export interface Database {
  /**
   * @description Save the provided chain state
   */
    save: (state: string) => void;
  /**
   * @description Delete any saved chain state
   */
    delete: () => void;
}

// REM: what if the database format changes?  Should we include a version?
const named = (chain: string): string => {
  return `${pkg.name}.${chain}`;
}

/**
 * @name database
 *
 * @description Creates a `Database` with an optional name or names it
 * after this package ("smoldot-provider").  The type of database will be
 * detected depending on whether running in the browser or nodejs.
 * 
 * @example
 * <BR>
 *
 * ```javascript
 * const provider = new SmoldotProvider(chainSpec, database('polkadot'));
 * const api = new Api(provider);
 * ```
 */
export default function database(chain?: string): Database {
  chain = chain || pkg.name;
  return create(named(chain));
}
