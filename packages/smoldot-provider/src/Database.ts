import * as pkg from '../package.json';

// REM: Don't know how to make typescript happy. This doesn't work:
// let create: (name: string) => Database | undefined = undefined;
let create: any = undefined;

if (typeof window === 'object') {
  create = await import('./BrowserDatabase');
} else {
  create = await import('./FsDatabase');
}

export interface Database {
    save: (state: string) => void;
    delete: () => void;
}

// REM: what if the database format changes?  Should we include a version?
const named = (chain: string): string => {
  return `${pkg.name}.${chain}`;
}

export default function database(chain?: string): Database {
  chain = chain || pkg.name;
  return create(named(chain));
}
