"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mnemonicToLegacySeed = mnemonicToLegacySeed;

var _util = require("@polkadot/util");

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _bip = require("./bip39");

var _validate = require("./validate");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name toSeed
 * @summary Creates a valid Ethereum/Bitcoin-compatible seed from a mnemonic input
 * @example
 * <BR>
 *
 * ```javascript
 * import { mnemonicGenerate, mnemonicToBip39, mnemonicValidate } from '@polkadot/util-crypto';
 *
 * const mnemonic = mnemonicGenerate(); // => string
 * const isValidMnemonic = mnemonicValidate(mnemonic); // => boolean
 *
 * if (isValidMnemonic) {
 *   console.log(`Seed generated from mnemonic: ${mnemonicToBip39(mnemonic)}`); => u8a
 * }
 * ```
 */
function mnemonicToLegacySeed(mnemonic, password = '', onlyJs = false, byteLength = 32) {
  (0, _util.assert)((0, _validate.mnemonicValidate)(mnemonic), 'Invalid bip39 mnemonic specified');
  (0, _util.assert)([32, 64].includes(byteLength), `Invalid seed length ${byteLength}, expected 32 or 64`);

  if (byteLength && byteLength === 32) {
    return (0, _wasmCrypto.isReady)() && !onlyJs ? (0, _wasmCrypto.bip39ToSeed)(mnemonic, password) : (0, _bip.mnemonicToSeedSync)(mnemonic, password).subarray(0, 32);
  } else if (byteLength === 64) {
    return (0, _bip.mnemonicToSeedSync)(mnemonic, password);
  } else {
    return new Uint8Array();
  }
}