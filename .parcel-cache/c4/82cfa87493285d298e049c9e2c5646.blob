"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "packageInfo", {
  enumerable: true,
  get: function () {
    return _packageInfo.packageInfo;
  }
});
exports.TextDecoder = void 0;

var _xGlobal = require("@polkadot/x-global");

var _fallback = require("./fallback");

var _packageInfo = require("./packageInfo");

// Copyright 2017-2021 @polkadot/x-textencoder authors & contributors
// SPDX-License-Identifier: Apache-2.0
const TextDecoder = typeof _xGlobal.xglobal.TextDecoder === 'undefined' ? _fallback.TextDecoder : _xGlobal.xglobal.TextDecoder;
exports.TextDecoder = TextDecoder;