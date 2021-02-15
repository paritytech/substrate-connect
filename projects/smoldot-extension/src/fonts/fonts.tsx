import { createGlobalStyle } from 'styled-components';

import Web3Regular from '../assets/Web3-Regular.woff';
import Web3Regular2 from '../assets/Web3-Regular.woff2';

export default createGlobalStyle`
    @font-face {
        font-family: 'Web3-Regular';
        src: local('Web3-Regular'), local('Web3-Regular'),
            url(${Web3Regular}) format('woff'),
            url(${Web3Regular2}) format('woff2');
        font-weight: 300;
        font-style: normal;
    }

    body {
        width: 240px;
        display: flex;
        overflow: hidden;
    }
`;
