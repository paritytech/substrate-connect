import React, { FunctionComponent } from 'react';
import { Switch } from '@material-ui/core';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';

interface Props {
    checked: boolean;
    backgroundColor?: string;
    color?: string;
}

const AntSwitch: FunctionComponent<Props> = ({ checked = false, backgroundColor = '#ccc', color='#ccc' }) => {
    const ASwitch = withStyles((theme: Theme) =>
        createStyles({
        root: {
            width: 28,
            height: 16,
            padding: 0,
            display: "flex",
            overflow: "inherit"
        },
        switchBase: {
            padding: 2,
            color: theme.palette.grey[500],
            "&$checked": {
                transform: "translateX(10px)",
                color: theme.palette.common.white,
                "& + $track": {
                    opacity: 1,
                    backgroundColor, // background color of switch active
                    borderColor: color
                }
            }
        },
        thumb: {
            width: 14,
            height: 14,
            boxShadow: "none"
        },
        track: {
            border: `1px solid ${theme.palette.grey[500]}`,
            borderRadius: 20 / 2,
            opacity: 1,
            backgroundColor: theme.palette.common.white
        },
        checked: {}
        })
    )(Switch);
    return (<ASwitch checked={checked} />);
}

export default AntSwitch;