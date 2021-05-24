/* eslint-disable @typescript-eslint/unbound-method */
import {  capitalizeFirstLetter, debug } from '.';
import { jest } from '@jest/globals';

const random = (length = 5) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let str = '';
  for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

describe('test utils', () => {
  test('Test capitalizeFirstLetter', () => {
    const str = random();
    const strFirstLetter = str.charAt(0).toUpperCase();
    const outcome = capitalizeFirstLetter(str);
    expect(outcome.charAt(0)).toBe(strFirstLetter);
  });

  beforeEach(() => {
    jest.resetModules();  
    process.env = { NODE_ENV: 'development' };
  });

  test('Test debug with 1 param', () => {
    console.debug = jest.fn();
    debug('Sample');
    expect(console.debug).toHaveBeenCalledWith('Sample');
  });

  test('Test debug with string and extra string', () => {
    console.debug = jest.fn();
    debug('Sample', 'Something');
    expect(console.debug).toHaveBeenCalledWith('Sample', 'Something');
  });

  test('Test debug with string and extra object', () => {
    console.debug = jest.fn();
    debug('Sample', {a:"123"});
    expect(console.debug).toHaveBeenCalledWith('Sample', {a:"123"});
  });

});
