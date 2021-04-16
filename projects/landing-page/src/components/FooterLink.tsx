import * as React from 'react';
import { Box, Link, LinkProps, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    [theme.breakpoints.down('xs')]: {
      display: 'block',
      marginBottom: theme.spacing(),
    },
  },
}));

const FooterLink: React.FunctionComponent<LinkProps> = ({children, ...props}) => {
  const classes = useStyles();

  return (
    <Box component='span' mr={4} className={classes.root}>
      <Link color='textSecondary' variant='body2' target='_blank' rel='noreferrer' {...props}>{children}</Link>
    </Box>
  );
};
export default FooterLink;
