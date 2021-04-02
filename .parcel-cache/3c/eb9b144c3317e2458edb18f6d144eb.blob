"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hdLedger = hdLedger;

var _util = require("@polkadot/util");

var _mnemonic = require("../../mnemonic");

var _nacl = require("../../nacl");

var _validatePath = require("../validatePath");

var _derivePrivate = require("./derivePrivate");

var _master = require("./master");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function hdLedger(mnemonic, path) {
  (0, _util.assert)((0, _mnemonic.mnemonicValidate)(mnemonic), 'Invalid mnemonic passed to ledger derivation');
  (0, _util.assert)((0, _validatePath.hdValidatePath)(path), 'Invalid derivation path');
  return (0, _nacl.naclKeypairFromSeed)(path.split('/').slice(1).map(n => parseInt(n.replace("'", ''), 10)).map(n => n < _validatePath.HARDENED ? n + _validatePath.HARDENED : n).reduce((x, n) => (0, _derivePrivate.ledgerDerivePrivate)(x, n), (0, _master.ledgerMaster)(mnemonic)).slice(0, 32));
}