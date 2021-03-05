import * as React from 'react';
import { makeStyles, Theme, Popover, Typography, Box, ButtonBase, Button, Grid, Tooltip, Divider } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { ExpandMore, SystemUpdateAlt, InsertDriveFile, Publish } from '@material-ui/icons';
import { IconWeb3 } from '../components';
import { InputButton, InputText, InputWrap } from './Inputs';
import { Network, Parachain } from '../types';

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: `calc(100% + ${theme.spacing(8)}px)`,
    marginLeft: theme.spacing(-4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    border: `1px solid transparent`,
    '&.unknown': {
      background: grey[100],
    },
    '&:hover': {
      border: `1px solid ${theme.palette.grey[200]}`,
    },
  },
  networkIconRoot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(5),
    height: theme.spacing(5),
    marginLeft: -4,
    marginRight: theme.spacing(2),
    backgroundColor: grey[100],
    borderRadius: '50%',
  },
  buttonBaseGroup: {
    '& button:not(last-child)': {
      marginRight: theme.spacing(1),
    }
  },
  // TODO Popup to use the same component
  popoverRoot: {
    '& .MuiPopover-paper': {
      width: theme.spacing(45),
      paddingTop: theme.spacing(1.5),
      boxShadow: `0px 4px 12px rgb(0 0 0 / 15%)`,
    },
    '& .MuiPopover-paper > *:not(hr)': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      '&:not(button)': {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
      }
    }
  },
}));

const ClientMenu: React.FunctionComponent<Network> = ({isKnown, name, chainspecPath}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div className={classes.buttonBaseGroup}>
        { !isKnown &&
        <Tooltip
          title='Save <network> chainspec to extension'
          placement='top'
          arrow
        >
          <ButtonBase>
            <SystemUpdateAlt fontSize='small' />
          </ButtonBase>
        </Tooltip>
        }
        <ButtonBase onClick={handleClick}>
          <ExpandMore fontSize='small' />
        </ButtonBase>
      </div>

      <Popover
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className={classes.popoverRoot}
      >

        <Typography variant='overline'>Chainspec</Typography>
        <InputWrap>

          <InputText readOnly defaultValue={chainspecPath}/>
          <Divider orientation='vertical' flexItem/>
          <InputButton>
            <InsertDriveFile fontSize='small'/>
          </InputButton>
          <Divider orientation='vertical' flexItem/>

          { isKnown
            ? <InputButton>
              <Publish fontSize='small'/>
            </InputButton>
            : <InputButton>
              <SystemUpdateAlt fontSize='small' />
            </InputButton>
          }

        </InputWrap>
        <InputWrap>
          <InputText readOnly defaultValue={name}/>
        </InputWrap>
        <Divider/>
        <Button onClick={handleClose} fullWidth>Cancel</Button>

      </Popover>
    </>
  );
}


const ClientItem: React.FunctionComponent<Network | Parachain> = ({...props}) => {
  const classes = useStyles();

  return (
    <Grid container className={`${classes.root} ${!props.isKnown && 'unknown'}`} >
      <Typography variant='h2' component='div'>
        <Box component='span' className={classes.networkIconRoot}>
          <IconWeb3>{props.name}</IconWeb3>
        </Box>
        {props.name}
      </Typography>
      <ClientMenu {...props}/>
    </Grid>
  );
};

export default ClientItem;
