import { createGlobalStyle } from 'styled-components';

import Web3Regular from './Web3-Regular.woff';
import Web3Regular2 from './Web3-Regular.woff2';

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
        margin: 0 !important;
    }
    #options {
        margin: 16px 16px 0 120px !important;
        max-width: 655px;
        @media (max-width: 840px) {
            max-width: none;
            margin: 16px 32px 0 !important;
        }
    }
`;
