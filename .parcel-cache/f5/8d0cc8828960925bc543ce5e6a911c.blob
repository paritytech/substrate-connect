"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bnSqrt = bnSqrt;

var _bn = _interopRequireDefault(require("bn.js"));

var _assert = require("../assert");

var _bn2 = require("../bn");

// Copyright 2017-2021 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
// https://golb.hplar.ch/2018/09/javascript-bigint.html
function newtonIteration(n, x0) {
  const x1 = n.div(x0).iadd(x0).ishrn(1);
  return x0.eq(x1) || x0.eq(x1.sub(_bn2.BN_ONE)) ? x0 : newtonIteration(n, x1);
}
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
  (0, _assert.assert)(value.gte(_bn2.BN_ZERO), 'square root of negative numbers is not supported');
  return value.lt(_bn2.BN_TWO) ? value : newtonIteration(value, new _bn.default(1));
}