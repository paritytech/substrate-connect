import * as React from 'react';
import { Link, LinkProps, makeStyles, Typography } from '@material-ui/core';
import { substrateGray } from './theme';
import { fade } from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles(theme => ({
  sidebar: {
    width: '345px',
    maxWidth: '345px',
    paddingLeft: theme.spacing(10),
    '& .fixed': {
      position: 'fixed',
    },
    [theme.breakpoints.down('sm')]: {
      '& .fixed': {
        width: '100%',
        maxWidth: 'none',
        left: 0,
        top: theme.spacing(0.5),
        padding: theme.spacing(),
        paddingLeft: theme.spacing(5),
        backgroundColor: fade(theme.palette.background.default, 0.95),
        borderBottom: `1px solid ${substrateGray[200]}`
      },
    },
  },
  link: {
    display: 'block',
    marginBottom: theme.spacing(0.5),
    color: substrateGray[600],
    '&:hover': {
      color: substrateGray[900],
      textDecoration: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      marginRight: theme.spacing(3),
      marginBottom: theme.spacing(),
      color: substrateGray[900],
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

export const SidebarLink: React.FunctionComponent<LinkProps> = ({children, ...props}) => {
  const classes = useStyles();
  return (
    <Link className={classes.link} {...props}>
      <Typography component='span' variant='subtitle2'>
        {children}
      </Typography>
    </Link>
  );
};
