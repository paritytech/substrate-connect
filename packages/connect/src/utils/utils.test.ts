import { isUndefined } from './';

test('Test utils', () => {
  let check: boolean;
  const something: unknown = undefined;
  check = isUndefined(something);
  expect(check).toBe(true);
  const somethingElse: unknown = '123';
  check = isUndefined(somethingElse);
  expect(check).toBe(false);
});
