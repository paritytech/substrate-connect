import { writeFileSync, unlinkSync } from 'fs';

import Database from './Database';

export default class FsDatabase implements Database {
  #path: string;

  constructor(path: string) {
      this.#path = path;
  }

  save(state: string) {
      writeFileSync(this.#path, state);
  }

  delete() {
      unlinkSync(this.#path);
  }
}
