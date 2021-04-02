"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hdEthereum = hdEthereum;

var _util = require("@polkadot/util");

var _hmac = require("../../hmac");

var _secp256k = require("../../secp256k1");

var _validatePath = require("../validatePath");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const MASTER_SECRET = (0, _util.stringToU8a)('Bitcoin seed');

function createCoded(secretKey, chainCode) {
  return {
    chainCode,
    publicKey: (0, _secp256k.secp256k1KeypairFromSeed)(secretKey).publicKey,
    secretKey
  };
}

function deriveChild(hd, index) {
  const indexBuffer = (0, _util.bnToU8a)(index, {
    bitLength: 32,
    isLe: false
  });
  const data = index >= _validatePath.HARDENED ? (0, _util.u8aConcat)(new Uint8Array(1), hd.secretKey, indexBuffer) : (0, _util.u8aConcat)(hd.publicKey, indexBuffer);

  try {
    const I = (0, _hmac.hmacSha512)(hd.chainCode, data);
    return createCoded((0, _secp256k.secp256k1PrivateKeyTweakAdd)(hd.secretKey, I.slice(0, 32)), I.slice(32));
  } catch (err) {
    // In case parse256(IL) >= n or ki == 0, proceed with the next value for i
    return deriveChild(hd, index + 1);
  }
}

function hdEthereum(seed, path = '') {
  const I = (0, _hmac.hmacSha512)(MASTER_SECRET, seed);
  const hd = createCoded(I.slice(0, 32), I.slice(32));

  if (!path || path === 'm' || path === 'M' || path === "m'" || path === "M'") {
    return hd;
  }

  (0, _util.assert)((0, _validatePath.hdValidatePath)(path), 'Invalid derivation path');
  return path.split('/').slice(1).reduce((hd, c) => deriveChild(hd, parseInt(c, 10) + (c.length > 1 && c.endsWith("'") ? _validatePath.HARDENED : 0)), hd);
}