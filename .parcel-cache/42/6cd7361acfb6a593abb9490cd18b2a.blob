"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seeder = seeder;

var _util = require("@polkadot/util");

// Copyright 2017-2021 @polkadot/ui-shared authors & contributors
// SPDX-License-Identifier: Apache-2.0
const DIVISOR = 256 * 256;

function seeder(_seed = new Uint8Array(32)) {
  const seed = (0, _util.isU8a)(_seed) ? _seed : (0, _util.stringToU8a)(_seed);
  let index = seed[Math.floor(seed.length / 2)] % seed.length - 1;

  const next = () => {
    index += 1;

    if (index === seed.length) {
      index = 0;
    }

    return seed[index];
  };

  return () => {
    return (next() * 256 + next()) / DIVISOR;
  };
}