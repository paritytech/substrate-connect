"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ledgerMaster = ledgerMaster;

var _util = require("@polkadot/util");

var _hmac = require("../../hmac");

var _bip = require("../../mnemonic/bip39");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const ED25519_CRYPTO = 'ed25519 seed'; // gets an xprv from a mnemonic

function ledgerMaster(mnemonic) {
  const seed = (0, _bip.mnemonicToSeedSync)(mnemonic);
  const chainCode = (0, _hmac.hmacSha256)(ED25519_CRYPTO, new Uint8Array([1, ...seed]));
  let priv;

  while (!priv || priv[31] & 0b00100000) {
    priv = (0, _hmac.hmacSha512)(ED25519_CRYPTO, priv || seed);
  }

  priv[0] &= 0b11111000;
  priv[31] &= 0b01111111;
  priv[31] |= 0b01000000;
  return (0, _util.u8aConcat)(priv, chainCode);
}