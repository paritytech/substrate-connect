// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * Asserts that `val` is not `null` or `undefined`
 *
 * @param val - The value to check
 * @param msg - The error message to throw
 */
export function assertIsDefined<T>(
  val: T,
  msg: string
): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(msg);
  }
}
