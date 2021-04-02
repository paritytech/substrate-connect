"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hdLedger = hdLedger;

var _util = require("@polkadot/util");

var _mnemonic = require("../../mnemonic");

var _nacl = require("../../nacl");

var _derivePrivate = require("./derivePrivate");

var _master = require("./master");

var _validatePath = require("./validatePath");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const HARDENED = 0x80000000;

function hdLedger(mnemonic, path) {
  (0, _util.assert)((0, _mnemonic.mnemonicValidate)(mnemonic), 'Invalid mnemonic passed to ledger derivation');
  (0, _util.assert)((0, _validatePath.ledgerValidatePath)(path), 'Invalid derivation path');
  return (0, _nacl.naclKeypairFromSeed)(path.split('/').slice(1).map(n => parseInt(n.replace("'", ''), 10)).map(n => n < HARDENED ? n + HARDENED : n).reduce((x, n) => (0, _derivePrivate.ledgerDerivePrivate)(x, n), (0, _master.ledgerMaster)(mnemonic)).slice(0, 32));
}