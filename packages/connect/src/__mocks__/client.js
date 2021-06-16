/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JSDOM } from 'jsdom';
const dom = new JSDOM();

window.document = dom.window.document;
window.window = dom.window;

const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => {
        return store[key];
      },
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
      removeItem: (key) => {
        delete store[key];
      }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
