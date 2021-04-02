"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractAuthor = extractAuthor;

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function extractAuthor(digest, sessionValidators = []) {
  const [citem] = digest.logs.filter(({
    type
  }) => type === 'Consensus');

  if (citem) {
    const [engine, data] = citem.asConsensus;
    return engine.extractAuthor(data, sessionValidators);
  } else {
    const [pitem] = digest.logs.filter(({
      type
    }) => type === 'PreRuntime');

    if (pitem) {
      const [engine, data] = pitem.asPreRuntime;
      return engine.extractAuthor(data, sessionValidators);
    }
  }

  return undefined;
}