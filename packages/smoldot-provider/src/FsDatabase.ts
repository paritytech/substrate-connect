import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import mkdirp from 'mkdirp';
import { Database } from './Database';


export class FsDatabase implements Database {
  #path: string;

  constructor(name: string) {
    const cwd = process.cwd();
    const dbDir = join(cwd, '.chains');
    mkdirp.sync(dbDir);

    this.#path = join(dbDir, `${name}.json`);
  }

  save(state: string) {
    writeFileSync(this.#path, state);
  }

  delete() {
      unlinkSync(this.#path);
  }
}

export default (name: string): Database => {
  return new FsDatabase(name) as Database;
}
