// SPDX-License-Identifier: Apache-2

import { hot } from "react-hot-loader/root";
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export default function render (Index: React.FC): void {
  const rootId = 'root';
  const rootElement = document.getElementById(rootId);

  if (!rootElement) {
    throw new Error(`Unable to find element with id '${rootId}'`);
  }

  cryptoWaitReady()
    .then((): void => {
      ReactDOM.render(
        hot(
          <Suspense fallback='...'>
            <HashRouter>
              <Index />
            </HashRouter>
          </Suspense>,
          rootElement
        )
      );
    })
    .catch(console.error);
}