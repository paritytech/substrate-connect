import { writeFileSync, readFileSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import mkdirp from 'mkdirp';
import { Database } from './Database';


/**
 * @name FsDatabase
 *
 * @description The `FsDatabase` saves chain state to the current working 
 * directory in a subdirectory named ".chains".  The directory is created
 * on construction if it doesn't exist.
 */
export class FsDatabase implements Database {
  #path: string;

  constructor(name: string) {
    const cwd = process.cwd();
    const dbDir = join(cwd, '.chains');
    mkdirp.sync(dbDir);

    this.#path = join(dbDir, `${name}.json`);
  }

  load(): string {
    try {
      statSync(this.#path);
    } catch (error: any) { 
      // Typescript does not allow type annotations on catch blocks :(
      if (error.code === 'ENOENT') {
        return '';
      }

      throw error;
    }

    return readFileSync(this.#path, { encoding: 'utf-8' });
  }

  save(state: string) {
    writeFileSync(this.#path, state);
  }

  delete() {
      unlinkSync(this.#path);
  }
}

export function create(name: string): Database {
  return new FsDatabase(name) as Database;
}
