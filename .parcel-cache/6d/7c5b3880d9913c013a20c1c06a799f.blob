"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pbkdf2Sync = pbkdf2Sync;

var _util = require("@polkadot/util");

var _hmac = require("../hmac");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Adapted from https://gist.github.com/calvinmetcalf/91e8e84dc63c75f2aa53
function pbkdf2Sync(password, salt, rounds, len = 64) {
  let out = new Uint8Array();
  let num = 0;
  const block = (0, _util.u8aConcat)(salt, new Uint8Array(4));

  while (out.length < len) {
    num++;
    block.set((0, _util.bnToU8a)(num, {
      bitLength: 32,
      isLe: false
    }), salt.length);
    let prev = (0, _hmac.hmacSha512)(password, block);
    const md = prev;
    let i = 0;

    while (++i < rounds) {
      prev = (0, _hmac.hmacSha512)(password, prev);
      let j = -1;

      while (++j < prev.length) {
        md[j] ^= prev[j];
      }
    }

    out = (0, _util.u8aConcat)(out, md);
  }

  return out.slice(0, len);
}