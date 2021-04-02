"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wasmBytes = void 0;

var _base = require("./base64");

var _bytes = require("./bytes");

var _fflate = require("./fflate");

// Copyright 2019-2021 @polkadot/wasm-crypto-wasm authors & contributors
// SPDX-License-Identifier: Apache-2.0
const wasmBytes = (0, _fflate.unzlibSync)((0, _base.toByteArray)(_bytes.bytes), new Uint8Array(_bytes.sizeUncompressed));
exports.wasmBytes = wasmBytes;