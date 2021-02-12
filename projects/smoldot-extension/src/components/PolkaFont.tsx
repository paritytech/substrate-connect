import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

// TODO: more icon-like props

const PFont = styled.span`
    font-family: 'Web3-Regular' !important;
    letter-spacing: 0 !important;
    display: inline-block;
    margin-right: 0.2em;
`;

const PolkaFont: FunctionComponent = ({ children }) => <PFont> {children}</PFont>;

export default PolkaFont;
