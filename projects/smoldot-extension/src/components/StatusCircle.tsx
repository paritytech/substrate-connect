import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { substrateGreen } from './theme';

export interface Props {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    borderColor?: string;
}

const SCircle = styled('div')<Props>`
        width: ${props =>
            props.size === 'small' ? '5px' :
            (props.size === 'medium' ? '10px' :
            (props.size === 'large' && '15px'))
        };
        height: ${props =>
            props.size === 'small' ? '5px' :
            (props.size === 'medium' ? '10px' :
            (props.size === 'large' && '15px'))
        };
        border-radius: ${props =>
            props.size === 'small' ? '5px' :
            (props.size === 'medium' ? '10px' :
            (props.size === 'large' && '15px'))
        };
        border: 1px solid ${props => props.borderColor || substrateGreen[500]};
        background-color: ${props => props.color || substrateGreen[100]};
        box-shadow: 0 0 5px 0px ${props => props.color || substrateGreen[100]};
    `;

const StatusCircle: FunctionComponent<Props> = ({ size='medium', color, borderColor }: Props) => {
    return (<SCircle data-testid='circle' {...{size, color, borderColor}} />);
}

export default StatusCircle;
