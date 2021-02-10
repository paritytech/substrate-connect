import React, { FunctionComponent, useState } from 'react';
import { Switch } from '@material-ui/core';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';

interface Props {
    activeColor?: string;
    activeBgColor?: string;
    activeBorderColor?: string;    
    deactiveColor?: string;
    deactiveBgColor?: string;
    deactiveBorderColor?: string;
    size?: string;
}

const AntSwitch: FunctionComponent<Props> = ({
        deactiveBorderColor='#BDBDBD',
        deactiveBgColor='white',
        deactiveColor = '#ccc',
        activeBorderColor = '#FCFCFC',
        activeBgColor = '#16DB9A',
        activeColor='#FCFCFC',
        size='m'
    }) => {
    const [extConnect, setExtConnect] = useState(true);
    const ASwitch = withStyles((theme: Theme) =>
        createStyles({
        root: {
            width: size === 's' ? 20 : 28,
            height: size === 's' ? 10 : 16,
            padding: 0,
            display: "flex",
            overflow: "inherit"
        },
        switchBase: {
            padding: size === 's' ? 1 : 2,
            color: deactiveColor,
            "&$checked": {
                transform: "translateX(10px)",
                color: activeColor,
                "& + $track": {
                    opacity: 1,
                    border: `1px solid ${activeBorderColor}`,
                    backgroundColor: activeBgColor, // background color of switch active
                    borderColor: activeColor
                }
            }
        },
        thumb: {
            width: size === 's' ? 10 : 14,
            height: size === 's' ? 10 : 14,
            boxShadow: "none"
        },
        track: {
            borderRadius: 20,
            opacity: 1,
            border: `1px solid ${deactiveBorderColor}`,
            backgroundColor: deactiveBgColor
        },
        checked: {}
        })
    )(Switch);
    
    return (
        <ASwitch checked={extConnect} onChange={e => setExtConnect(e.target.checked)} />
    );
}

export default AntSwitch;