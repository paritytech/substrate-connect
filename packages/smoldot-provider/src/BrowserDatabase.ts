import { Database } from './Database';

export class BrowserDatabase implements Database {
  #name: string;

  constructor(name: string) {
      this.#name = name;
  }

  save(state: string) {
      window.localStorage.setItem(this.#name, state);
  }

  delete() {
      window.localStorage.removeItem(this.#name);
  }
}

export default (name: string): Database => {
  return new BrowserDatabase(name) as Database;
}
