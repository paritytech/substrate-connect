"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bnSqrt = bnSqrt;

var _bn = _interopRequireDefault(require("bn.js"));

var _assert = require("../assert");

var _bn2 = require("../bn");

var _toBn = require("./toBn");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name bnSqrt
 * @summary Calculates the integer square root of a BN
 * @example
 * <BR>
 *
 * ```javascript
 * import BN from 'bn.js';
 * import { bnSqrt } from '@polkadot/util';
 *
 * bnSqrt(new BN(16)).toString(); // => '4'
 * ```
 */
function bnSqrt(value) {
  const n = (0, _toBn.bnToBn)(value);
  (0, _assert.assert)(n.gte(_bn2.BN_ZERO), 'square root of negative numbers is not supported'); // https://stackoverflow.com/questions/53683995/javascript-big-integer-square-root/
  // shortcut <= 2^53 - 1 to use the JS utils

  if (n.lte(_bn2.BN_MAX_INTEGER)) {
    return new _bn.default(Math.floor(Math.sqrt(n.toNumber())));
  } // Use sqrt(MAX_SAFE_INTEGER) as starting point. since we already know the
  // output will be larger than this, we expect this to be a safe start


  let x0 = new _bn.default(94906265);

  while (true) {
    const x1 = n.div(x0).iadd(x0).ishrn(1);

    if (x0.eq(x1) || x0.eq(x1.sub(_bn2.BN_ONE))) {
      return x0;
    }

    x0 = x1;
  }
}