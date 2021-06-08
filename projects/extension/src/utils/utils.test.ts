/* eslint-disable @typescript-eslint/unbound-method */
import {  capitalizeFirstLetter } from './utils';

const random = (length = 5) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let str = '';
  for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

test('Test capitalizeFirstLetter', () => {
  const str = random();
  const strFirstLetter = str.charAt(0).toUpperCase();
  const outcome = capitalizeFirstLetter(str);
  expect(outcome.charAt(0)).toBe(strFirstLetter);
});
