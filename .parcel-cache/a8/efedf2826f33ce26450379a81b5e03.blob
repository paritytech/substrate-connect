"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hmacSha256 = hmacSha256;

var _hash = _interopRequireDefault(require("hash.js"));

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
function hmacSha256(key, data) {
  return Uint8Array.from(_hash.default // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  .hmac(_hash.default.sha256, key).update(data).digest());
}