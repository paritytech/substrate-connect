import React from 'react';

import { IconButton, IconButtonProps, makeStyles } from '@material-ui/core';

import Brightness3Icon from '@material-ui/icons/Brightness3';
import Brightness7Icon from '@material-ui/icons/Brightness7';

interface Props extends IconButtonProps {
  theme: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.primary.main,
  },
}));

const ThemeButton: React.FunctionComponent<Props> = ({ theme, ...props }: Props) => {
  const classes = useStyles();
  return (
    <IconButton {...props} className={classes.root}>
      {theme ? <Brightness3Icon /> : <Brightness7Icon />}
    </IconButton>
  );
};

export default ThemeButton;