"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toByteArray = toByteArray;
// Copyright 2019-2021 @polkadot/wasm-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// MIT License
//
// Copyright (c) 2014 Jameson Little
//
// https://github.com/beatgammit/base64-js/blob/88957c9943c7e2a0f03cdf73e71d579e433627d3/index.js
// This only contains the toByteArray function (no encoding)
//
// Only tweaks make here are some TS adjustments (we use strict null checks), the code is otherwise as-is with
// only the single required function provided
const CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = [];
const revLookup = [];

for (let i = 0; i < CODE.length; ++i) {
  lookup[i] = CODE[i];
  revLookup[CODE.charCodeAt(i)] = i;
} // Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications


revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64) {
  const len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  } // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42


  const validLen = b64.indexOf('=');
  return validLen === -1 ? [len, 0] : [validLen, 4 - validLen % 4];
}

function toByteArray(b64) {
  const [validLen, placeHoldersLen] = getLens(b64);
  const arr = new Uint8Array((validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen);
  let curByte = 0;
  let i; // if there are placeholders, only get up to the last complete 4 chars

  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  for (i = 0; i < len; i += 4) {
    const tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 0xFF;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    const tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 0xFF;
  } else if (placeHoldersLen === 1) {
    const tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
}