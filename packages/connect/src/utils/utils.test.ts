import { isUndefined } from './';

test('Test util: isUndefined', () => {
  let check: boolean;
  let value: unknown = undefined;
  check = isUndefined(value);
  expect(check).toBe(true);
  value = 'Not undefined';
  check = isUndefined(value);
  expect(check).toBe(false);
});
