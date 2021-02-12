import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const PFont = styled.span`
    font-family: 'Web3-Regular' !important;
    letter-spacing: 0 !important;
    display: contents;
`;

const PolkaFont: FunctionComponent = ({ children }) => <PFont> {children}</PFont>;

export default PolkaFont;
