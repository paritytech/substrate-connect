"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.base64Decode = base64Decode;

var _base64Js = _interopRequireDefault(require("base64-js"));

var _validate = require("./validate");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name base64Decode
 * @summary Decodes a base64 value.
 * @description
 * From the provided input, decode the base64 and return the result as an `Uint8Array`.
 */
function base64Decode(value) {
  (0, _validate.base64Validate)(value);
  return _base64Js.default.toByteArray(value);
}