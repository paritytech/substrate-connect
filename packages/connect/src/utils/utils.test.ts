import { jest } from '@jest/globals';
import { isUndefined, eraseRecord } from './';

test('isUndefined returns true for undefined otherwise false', () => {
  let check: boolean;
  let value: unknown = undefined;
  check = isUndefined(value);
  expect(check).toBe(true);
  value = 'Not undefined';
  check = isUndefined(value);
  expect(check).toBe(false);
});

test('eraseRecord removes all entries', () => {
  const record = { 'foo': 'bar', 'baz': 'quux' };
  eraseRecord(record);
  expect(Object.keys(record).length).toBe(0);
});

test('eraseRecord calls back with each entry', () => {
  const record = { 'foo': 'bar', 'baz': 'quux' };
  const spy = jest.fn();
  eraseRecord(record, spy);
  expect(spy).toHaveBeenCalledTimes(2);
});
