import { createContext } from 'react';
import { NetworkCtx } from '../types';

const NetworkContext = createContext<NetworkCtx>({} as NetworkCtx);

export { NetworkContext };
