import { Database } from './Database';

/**
 * @name BrowserDatabase
 *
 * @description The `BrowserDatabase` saves chain state to localStorage
 * with the key specified by `name` prefixed with "smoldot::chainstate::"
 */
export class BrowserDatabase implements Database {
  #name: string;

  constructor(name: string) {
    this.#name = `smoldot::chainstate::${name}`;
  }

  load(): string {
    return window.localStorage.getItem(this.#name) || '';
  }

  save(state: string): void {
    window.localStorage.setItem(this.#name, state);
  }

  delete(): void {
    window.localStorage.removeItem(this.#name);
  }
}

export function create(name: string): Database {
  return new BrowserDatabase(name) as Database;
}
