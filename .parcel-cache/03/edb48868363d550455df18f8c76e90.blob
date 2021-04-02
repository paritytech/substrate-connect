"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeAddress = decodeAddress;

var _util = require("@polkadot/util");

var _decode = require("../base58/decode");

var _checksum = require("./checksum");

var _defaults = require("./defaults");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Original implementation: https://github.com/paritytech/polka-ui/blob/4858c094684769080f5811f32b081dd7780b0880/src/polkadot.js#L6
function decodeAddress(encoded, ignoreChecksum, ss58Format = -1) {
  if ((0, _util.isU8a)(encoded) || (0, _util.isHex)(encoded)) {
    return (0, _util.u8aToU8a)(encoded);
  }

  try {
    const decoded = (0, _decode.base58Decode)(encoded);
    (0, _util.assert)(_defaults.defaults.allowedEncodedLengths.includes(decoded.length), 'Invalid decoded address length');
    const [isValid, endPos, ss58Length, ss58Decoded] = (0, _checksum.checkAddressChecksum)(decoded);
    (0, _util.assert)(ignoreChecksum || isValid, 'Invalid decoded address checksum');
    (0, _util.assert)([-1, ss58Decoded].includes(ss58Format), `Expected ss58Format ${ss58Format}, received ${ss58Decoded}`);
    return decoded.slice(ss58Length, endPos);
  } catch (error) {
    throw new Error(`Decoding ${encoded}: ${error.message}`);
  }
}