import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popup from './containers/Popup';
import { Background } from './background/';
import { debug } from './utils/debug';

chrome.runtime.getBackgroundPage(backgroundPage => {
  const bg = backgroundPage as Background;
  debug('GOT BACKGROUND MANAGER', bg.manager);
  bg.manager.on('stateChanged', () => {
    console.log('BG MANAGER STATE CHANGED', bg.manager.getState());
  });
});

ReactDOM.render(<Popup />, document.getElementById('popup'));
