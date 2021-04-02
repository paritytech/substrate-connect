"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeAddress = encodeAddress;

var _util = require("@polkadot/util");

var _encode = require("../base58/encode");

var _decode = require("./decode");

var _defaults = require("./defaults");

var _sshash = require("./sshash");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Original implementation: https://github.com/paritytech/polka-ui/blob/4858c094684769080f5811f32b081dd7780b0880/src/polkadot.js#L34
function encodeAddress(_key, ss58Format = _defaults.defaults.prefix) {
  // decode it, this means we can re-encode an address
  const key = (0, _decode.decodeAddress)(_key);
  (0, _util.assert)(ss58Format >= 0 && ss58Format <= 16383 && ![46, 47].includes(ss58Format), 'Out of range ss58Format specified');
  (0, _util.assert)(_defaults.defaults.allowedDecodedLengths.includes(key.length), `Expected a valid key to convert, with length ${_defaults.defaults.allowedDecodedLengths.join(', ')}`);
  const isPublicKey = [32, 33].includes(key.length);
  const input = (0, _util.u8aConcat)(new Uint8Array(ss58Format < 64 ? [ss58Format] : [(ss58Format & 0b0000000011111100) >> 2 | 0b01000000, ss58Format >> 8 | (ss58Format & 0b0000000000000011) << 6]), key);
  return (0, _encode.base58Encode)((0, _util.u8aConcat)(input, (0, _sshash.sshash)(input).subarray(0, isPublicKey ? 2 : 1)));
}