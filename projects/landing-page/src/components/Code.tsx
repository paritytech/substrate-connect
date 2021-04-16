import * as React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.background.paper,
    borderRadius: theme.spacing(0.5),
  },
  heading: {
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`
  },
}));

interface HeadingProps {
  heading?: string | number;
}
export const Code: React.FunctionComponent<HeadingProps> = ({children, heading}) => {
  const classes = useStyles();
  return (
    <Box p={2} mb={2} mt={2} className={classes.root}>
      {heading &&
        <Typography component='div' variant='h4' className={classes.heading}>
          {heading}
        </Typography>
      }
      <Typography variant='subtitle2'>
        {children}
      </Typography>
    </Box>
  );
};
