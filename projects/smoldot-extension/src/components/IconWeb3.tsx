import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

// TODO: more icon-like props

const Icon = styled.span`
    font-family: 'Web3-Regular' !important;
    letter-spacing: 0 !important;
    display: inline-block;
    margin-right: 0.2em;
`;

const IconWeb3: FunctionComponent = ({ children }) => <Icon>{children}</Icon>;

export default IconWeb3;
