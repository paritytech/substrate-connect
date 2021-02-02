// // Copyright 2018-2021 @paritytech/Nomidot authors & contributors
// // This software may be modified and distributed under the terms
// // of the Apache-2.0 license. See the LICENSE file for details.
// import React, { useEffect, useState } from 'react';
// import { ApiPromise } from '@polkadot/api';

// import { ApiRxContextProviderProps } from './types';
// import { useDidUpdateEffect } from './util';

// export interface ApiPromiseContextType {
//   api: ApiPromise; // From @polkadot/api\
//   isApiReady: boolean;
// }

// export const ApiPromiseContext: React.Context<ApiPromiseContextType> = React.createContext(
//   {} as ApiPromiseContextType
// );

export function ApiPromiseContextProvider(){
//   props: ApiRxContextProviderProps
// ): React.ReactElement {
//   const { children = null, provider } = props;
//   const [apiPromise, setApiPromise] = useState<ApiPromise>(
//     new ApiPromise({ provider })
//   );
//   const [isReady, setIsReady] = useState(false);

//   useDidUpdateEffect(() => {
//     // We want to fetch all the information again each time we reconnect. We
//     // might be connecting to a different node, or the node might have changed
//     // settings.
//     setApiPromise(new ApiPromise({ provider }));

//     setIsReady(false);
//   }, [provider]);

//   useEffect(() => {
//     // We want to fetch all the information again each time we reconnect. We
//     // might be connecting to a different node, or the node might have changed
//     // settings.
//     apiPromise.isReady.then(_ => {
//       console.log(`Api is ready.`);
//       setIsReady(true);
//     });
//   }, [apiPromise.isReady]);

//   return (
//     <ApiPromiseContext.Provider
//       value={{ api: apiPromise, isApiReady: isReady }}
//     >
//       {children}
//     </ApiPromiseContext.Provider>
//   );
}
