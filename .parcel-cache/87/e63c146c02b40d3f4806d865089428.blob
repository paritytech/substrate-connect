"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UITHEMES = exports.UITHEME_DEFAULT = exports.UIMODES = exports.UIMODE_DEFAULT = exports.LANGUAGE_DEFAULT = exports.ICONS = exports.ICON_DEFAULT_HOST = exports.ICON_DEFAULT = void 0;

var _type = require("./type");

// Copyright 2017-2021 @polkadot/ui-settings authors & contributors
// SPDX-License-Identifier: Apache-2.0
const LANGUAGE_DEFAULT = 'default';
exports.LANGUAGE_DEFAULT = LANGUAGE_DEFAULT;
const UIMODE_DEFAULT = !_type.isPolkadot && typeof window !== 'undefined' && window.location.host.includes('ui-light') ? 'light' : 'full';
exports.UIMODE_DEFAULT = UIMODE_DEFAULT;
const UIMODES = [{
  info: 'full',
  text: 'Fully featured',
  value: 'full'
}, {
  info: 'light',
  text: 'Basic features only',
  value: 'light'
}];
exports.UIMODES = UIMODES;
const UITHEME_DEFAULT = _type.isPolkadot ? 'polkadot' : 'substrate';
exports.UITHEME_DEFAULT = UITHEME_DEFAULT;
const UITHEMES = [{
  info: 'polkadot',
  text: 'Polkadot',
  value: 'polkadot'
}, {
  info: 'substrate',
  text: 'Substrate',
  value: 'substrate'
}];
exports.UITHEMES = UITHEMES;
const ICON_DEFAULT = 'default';
exports.ICON_DEFAULT = ICON_DEFAULT;
const ICON_DEFAULT_HOST = _type.isPolkadot ? 'polkadot' : 'substrate';
exports.ICON_DEFAULT_HOST = ICON_DEFAULT_HOST;
const ICONS = [{
  info: 'default',
  text: 'Default for the connected node',
  value: 'default'
}, {
  info: 'polkadot',
  text: 'Polkadot',
  value: 'polkadot'
}, {
  info: 'substrate',
  text: 'Substrate',
  value: 'substrate'
}, {
  info: 'beachball',
  text: 'Beachball',
  value: 'beachball'
}];
exports.ICONS = ICONS;