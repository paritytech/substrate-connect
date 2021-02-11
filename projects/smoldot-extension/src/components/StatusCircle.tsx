/****
 *  Usage: 
 <StatusCircle
    size='m'
    color='#2AF386'
    borderColor='#16DB9A' />
******/
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

interface Props {
    size?: string;
    color?: string;
    borderColor?: string;
}

const StatusCircle: FunctionComponent<Props> = ({ size, color, borderColor }) => {
    const SCircle = styled.div`
        width: ${size === 's' ? '5px' : (size === 'm' ? '10px' : (size === 'l' ? '15px' : '10px'))};
        height: ${size === 's' ? '5px' : (size === 'm' ? '10px' : (size === 'l' ? '15px' : '10px'))};
        border-radius: ${size === 's' ? '5px' : (size === 'm' ? '10px' : (size === 'l' ? '15px' : '10px'))};
        border: 1px solid ${borderColor || '#000'};
        background-color: ${color || '#fff'};
        box-shadow: 0 0 5px 0px ${color || '#fff'};
    `;

    return (<SCircle />);
}

export default StatusCircle;
