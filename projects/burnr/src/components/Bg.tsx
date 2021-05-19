import React from 'react';

import { makeStyles, createStyles, Theme, Divider } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'fixed',
      width: 600,
      height: 600,
      top: 45,
      bottom: 0,
      left: 0,
      right: 0,
      margin: 'auto',
      background: theme.palette.secondary.dark,
      borderRadius: '50%',
      zIndex: -1,
      filter: 'blur(80px)',
    },
  })
);

export const BurnrBG: React.FunctionComponent = () => {
  const classes = useStyles();
  return <div className={classes.root} />;
};

export const BurnrDivider: React.FunctionComponent = () => (
  <Divider style={{ backgroundColor: 'transparent', height: .5 }} />
);
