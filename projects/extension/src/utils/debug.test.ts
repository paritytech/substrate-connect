import { debug } from './debug';
import { jest } from '@jest/globals';

const PREV_ENV_VAL = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { NODE_ENV: 'development' };
});

afterAll(() => {
  // reverts process.env to previous state before this test
  process.env = { ...PREV_ENV_VAL };
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
