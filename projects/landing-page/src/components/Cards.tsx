import * as React from 'react';
import { Box, Grid, GridProps, makeStyles, Typography } from '@material-ui/core';
import CallMadeIcon from '@material-ui/icons/CallMade';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { IconWeb3 } from '.';
import { substrateGray, substrateGreen } from './theme';

const useStyles = makeStyles(theme => ({
  card: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    width: `calc(50% - ${theme.spacing(2)}px)`,
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(),
    justifyContent: 'center',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      width: `calc(100% - ${theme.spacing(2)}px)`,
    },
    '&.network': {
      textAlign: 'left',
      width: `calc(25% - ${theme.spacing(2)}px)`,
      justifyContent: 'start',
      [theme.breakpoints.down('sm')]: {
        width: `calc(50% - ${theme.spacing(2)}px)`,
      },
    },
    '& .subtitle': {
      paddingBottom: theme.spacing(),
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&.placeholder': {
        opacity: 0,
      }
    },
    '& img': {
      width: '100%',
      objectFit: 'cover',
      backgroundColor: 'whitesmoke',
    },
    '& .content': {
      position: 'absolute',
      bottom: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
      width: `calc(100% - ${theme.spacing()}px)`,
    }
  },
  link: {
    position: 'absolute',
    width: 'calc(100% + 2px)',
    height: 'calc(100% + 2px)',
    top: -1,
    left: -1,
    padding: theme.spacing(),
    border: `1px solid transparent`,
    borderRadius: theme.spacing(),
    textAlign: 'right',
    color: theme.palette.primary.dark,
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&:not(:hover) svg': {
      opacity: 0,
    }
  },
  status: {
    display: 'inline-flex',
    width: 'max-content',
    maxWidth: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing(),
    paddingLeft: theme.spacing(0.8),
    paddingRight: theme.spacing(0.8),
    borderRadius: theme.spacing(0.5),
    fontSize: '0.8em',
    lineHeight: '250%',
    background: substrateGray[100],
    '& svg': {
      marginRight: theme.spacing(0.5),
      fontSize: '1em',
      color: substrateGray[400],
    },
    '&.supported svg': {
      color: substrateGreen[400],
    },
    '&.very svg': {
      color: '#EAC920',
    },
  },
}));


interface CardLinkProps {
  href: string;
}
const CardLink: React.FunctionComponent<CardLinkProps> = ({href, children}) => {
  const classes = useStyles();
  return (
    <a target='_blank' rel='noreferrer' href={href} className={classes.link}>
      <CallMadeIcon/>
      <Typography variant='subtitle2'>{children}</Typography>
    </a>
  );
};

interface CardProjectProps extends GridProps {
  title?: string;
  subtitle?: string;
  imageProps?: {
    path: string;
    position?: string;
    fullWidth?: boolean;
  },
  linkProps?: CardLinkProps;
}
export const CardProject: React.FunctionComponent<CardProjectProps> = ({children, title, subtitle, linkProps, imageProps}) => {
  const classes = useStyles();
  return (
    <Grid item className={classes.card} style={imageProps?.fullWidth ? { width: 'calc(100%)' } : {}}>
      {linkProps && <CardLink {...linkProps}/>}
      <Typography variant='h3'>{title}</Typography>
      {subtitle 
        ? <Typography className='subtitle' variant='body2'>{subtitle}</Typography>
        : <Typography className='subtitle placeholder' variant='body2'></Typography>
      }
      <img src={imageProps?.path || ''} alt={title} style={{objectPosition:imageProps?.position}} />
      <div className='content'>
        {children}
      </div>
    </Grid>
  );
};

interface CardStatusProps {
  status: 'supported' | 'soon' | 'very soon';
}
export const CardStatus: React.FunctionComponent<CardStatusProps> = ({status}) => {
  const classes = useStyles();
  return (
    <span className={`${classes.status} ${status}`}>
      <FiberManualRecordIcon/>
      <Typography variant='subtitle2'>{status}</Typography>
    </span>
  )
};

interface CardNetworkProps {
  title: string;
  statusProps: CardStatusProps;
  linkProps?: CardLinkProps;
}
export const CardNetwork: React.FunctionComponent<CardNetworkProps> = ({children, title, statusProps, linkProps}) => {
  const classes = useStyles();
  return (
    <Grid item className={`${classes.card} network`}>
      {linkProps && <CardLink {...linkProps}/>}
      <CardStatus {...statusProps} />
      <Box mb>
        <Typography variant='h3'>
          <Box component='span' mr={0.75}>
            <IconWeb3>{title.toLowerCase()}</IconWeb3>
          </Box>
          {title}
        </Typography>
      </Box>
      {children}
    </Grid>
  );
};
