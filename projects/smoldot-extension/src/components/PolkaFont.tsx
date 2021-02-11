import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

interface Props {
    size?: string;
}

const PFont = styled.div<Props>`
    font-family: 'Font Name';
    font-size: ${props => props.size || '13'}px;
    display: contents;
`;

const PolkaFont: FunctionComponent<Props> = ({ size, children }) => {

    return (
        <PFont size={size}>{children}</PFont>
    );
}

export default PolkaFont;
