"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ledgerDerivePrivate = ledgerDerivePrivate;

var _util = require("@polkadot/util");

var _hmac = require("../../hmac");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// performs hard-only derivation on the xprv
function ledgerDerivePrivate(xprv, index) {
  const kl = xprv.subarray(0, 32);
  const kr = xprv.subarray(32, 64);
  const cc = xprv.subarray(64, 96);
  const data = (0, _util.u8aConcat)([0], kl, kr, (0, _util.bnToU8a)(index, {
    bitLength: 32,
    isLe: true
  }));
  const z = (0, _hmac.hmacSha512)(cc, data);
  data[0] = 0x01;
  return (0, _util.u8aConcat)((0, _util.bnToU8a)((0, _util.u8aToBn)(kl, {
    isLe: true
  }).iadd((0, _util.u8aToBn)(z.subarray(0, 28), {
    isLe: true
  }).imul(_util.BN_EIGHT)), {
    bitLength: 512,
    isLe: true
  }).subarray(0, 32), (0, _util.bnToU8a)((0, _util.u8aToBn)(kr, {
    isLe: true
  }).iadd((0, _util.u8aToBn)(z.subarray(32, 64), {
    isLe: true
  })), {
    bitLength: 512,
    isLe: true
  }).subarray(0, 32), (0, _hmac.hmacSha512)(cc, data).subarray(32, 64));
}