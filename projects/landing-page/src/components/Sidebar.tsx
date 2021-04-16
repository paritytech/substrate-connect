import * as React from 'react';
import { Link, LinkProps, makeStyles, Typography } from '@material-ui/core';
import { substrateGray } from './theme';

const useStyles = makeStyles(theme => ({
  sidebar: {
    width: '345px !important',
    paddingLeft: theme.spacing(10),
    '& .fixed': {
      position: 'fixed',
    }
  },
  link: {
    display: 'block',
    marginBottom: theme.spacing(0.5),
    color: substrateGray[600],
    '&:hover': {
      color: substrateGray[900],
      textDecoration: 'none',
    },
    '& *': {
      color: 'inherit',
    },
  },
}));

export const Sidebar: React.FunctionComponent = ({children}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.sidebar}>
        <div className='fixed'>{children}</div>
      </div>
    </>
  )
};

export const SidebarLink: React.FunctionComponent<LinkProps> = ({children, underline='none', ...props}) => {
  const classes = useStyles();
  return (
    <Link className={classes.link} {...props}>
      <Typography component='span' variant='subtitle2'>
        {children}
      </Typography>
    </Link>
  );
};
