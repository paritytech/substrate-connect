import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

interface Props {
    size?: string;
}

const PolkaFont: FunctionComponent<Props> = ({ size, children }) => {
    const PFont = styled.div`
        font-family: 'Font Name';
        font-size: ${size || '13'}px;
        display: contents;
    `;

    return (
        <PFont>{children}</PFont>
    );
}

export default PolkaFont;
