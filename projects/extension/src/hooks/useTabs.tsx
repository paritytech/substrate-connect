/* eslint-disable @typescript-eslint/no-unsafe-call */
// SPDX-License-Identifier: Apache-2
import { useState, useEffect } from 'react';
import { NetworkCtx } from '../types';

const useTabs = (): NetworkCtx => {
  /* this is kinda of how  the access is to chrome tabs */
  const [tabs, setTabs] = useState<NetworkCtx>([] as NetworkCtx);
  
  useEffect((): void => {
    chrome.tabs.query({"currentWindow": true }, chromeTabs => {
      setTabs(chromeTabs.map(t => {
        return ({
          isActive: t.active,
          tabId: t.id || 0,
          url: t.url || '',
          uApp: {
            networks: [],
            name: '',
            enabled: true
          }
        })
      }))
    });
  }, []);

  return tabs;
}

export default useTabs;
