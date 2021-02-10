import { createGlobalStyle } from 'styled-components';

import Web3Regular from './Web3-Regular.woff';
import Web3Regular2 from './Web3-Regular.woff2';

export default createGlobalStyle`
    @font-face {
        font-family: 'Font Name';
        src: local('Font Name'), local('FontName'),
        url(${Web3Regular}) format('woff');
        url(${Web3Regular2}) format('woff2'),
        font-weight: 300;
        font-style: normal;
    }
`;
