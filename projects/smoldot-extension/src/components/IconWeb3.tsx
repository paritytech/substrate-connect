import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

// TODO: more icon-like props

interface Props {
    size?: string;
    color?: string;
}

const Icon = styled('span')<Props>`
    font-family: 'Web3-Regular' !important;
    font-size: ${props => props.size || '14'}px;
    color: ${props => props.color || '#000'};
    letter-spacing: 0 !important;
    display: inline-block;
    margin-right: 0.2em;
`;

const IconWeb3: FunctionComponent<Props> =
    ({ size, color, children }) => <Icon size={size} color={color}>{children}</Icon>;

export default IconWeb3;
