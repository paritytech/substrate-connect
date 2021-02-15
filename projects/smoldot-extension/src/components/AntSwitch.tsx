import React, { FunctionComponent, useState } from 'react';
import { Switch } from '@material-ui/core';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';

interface Props {
    isActive?: boolean;
    activeColor?: string;
    activeBgColor?: string;
    activeBorderColor?: string;    
    deactiveColor?: string;
    deactiveBgColor?: string;
    deactiveBorderColor?: string;
    size?: 'small' | 'medium';
}

const AntSwitch: FunctionComponent<Props> = ({
        isActive = true,
        size='small',
        ...props
    }) => {
    const [extConnect, setExtConnect] = useState(isActive);

    const ASwitch = withStyles((theme: Theme) =>
        createStyles({
        root: {
            width: size === 'small' ? 15 : 38,
            height: size === 'small' ? 8 : 18,
            padding: 0,
            display: "flex",
            overflow: "inherit"
        },
        switchBase: {
            padding: 1,
            color: props.deactiveColor || theme.palette.common.white,
            '&.Mui-checked': {
                transform: size === 'small' ? 'translateX(7px)' : 'translateX(20px)',
                color: props.activeColor || theme.palette.common.white,
                '& + $track': {
                    opacity: 1,
                    border: `1px solid ${props.activeBorderColor || theme.palette.primary.main}`,
                    backgroundColor: props.activeBgColor || theme.palette.primary.main,
                }
            }
        },
        thumb: {
            width: size === 'small' ? 6 : 16,
            height: size === 'small' ? 6 : 16,
            boxShadow: "none"
        },
        track: {
            borderRadius: 20,
            opacity: 1,
            border: `1px solid ${props.deactiveBorderColor || theme.palette.grey[400]}`,
            backgroundColor: props.deactiveBgColor || theme.palette.grey[300],
            boxSizing: 'border-box',
        },
        })
    )(Switch);
    
    return (
        <ASwitch checked={extConnect} onChange={e => setExtConnect(e.target.checked)} />
    );
}

export default AntSwitch;
