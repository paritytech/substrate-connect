"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/types-known authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */
// structs need to be in order

/* eslint-disable sort-keys */
const sharedTypes = {
  AccountInfo: 'AccountInfoWithProviders',
  Address: 'MultiAddress',
  FullIdentification: '()',
  // No staking, only session (as per config)
  LookupSource: 'MultiAddress',
  Keys: 'SessionKeys6'
};
const versioned = [{
  minmax: [0, 9],
  types: _objectSpread(_objectSpread({}, sharedTypes), {}, {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    CompactAssignments: 'CompactAssignmentsTo257',
    LookupSource: 'AccountId',
    RefCount: 'RefCountTo259',
    RewardDestination: 'RewardDestinationTo257',
    Keys: 'SessionKeys5'
  })
}, {
  minmax: [10, 12],
  types: _objectSpread(_objectSpread({}, sharedTypes), {}, {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    Keys: 'SessionKeys5',
    LookupSource: 'AccountId'
  })
}, {
  minmax: [13, 201],
  types: _objectSpread(_objectSpread({}, sharedTypes), {}, {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    LookupSource: 'AccountId'
  })
}, {
  minmax: [202, undefined],
  types: _objectSpread({}, sharedTypes)
}];
var _default = versioned;
exports.default = _default;