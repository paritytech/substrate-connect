import React from 'react';
import { makeStyles, Popover, Theme, Typography, Box, ButtonBase, Button, ButtonGroup, Grid, Menu, MenuItem, Tooltip, Divider } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { ExpandMore, SystemUpdateAlt, InsertDriveFile, Publish } from '@material-ui/icons';
import { IconWeb3 } from '../components';
import { InputButton, InputText, InputWrap } from './Inputs';

interface Props {
  isKnown?: boolean
}

const useStyles = makeStyles<Theme, Props>(theme => ({
  root: {
    background: ({ isKnown }) => !isKnown ? grey[100] : 'transparent',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    marginLeft: theme.spacing(-4),
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
  },
  networkIconRoot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(5),
    height: theme.spacing(5),
    marginRight: theme.spacing(2),
    backgroundColor: grey[100],
    borderRadius: '50%',
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

const ClientMenu: React.FunctionComponent<Props> = ({isKnown}) => {
  const classes = useStyles({isKnown});
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonGroup disableRipple>
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
        </ButtonGroup>

        <Popover
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          className={classes.popoverRoot}
        >

          <Typography variant='overline'>Chainspec</Typography>
          <InputWrap>

            <InputText readOnly defaultValue='chainspec.json'/>
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
            <InputText readOnly={!isKnown} defaultValue='<networkName>'/>
          </InputWrap>
          <Divider/>
          <Button onClick={handleClose} fullWidth>Cancel</Button>

        </Popover>
    </>
  );
}


const ClientItem: React.FunctionComponent<Props> = ({isKnown = true}) => {
  const classes = useStyles({isKnown});

  return (
    <Grid container wrap='nowrap' justify='space-between' className={classes.root} >
    <Typography variant='h2' component='div'>
      <Box component='span' className={classes.networkIconRoot}>
          <IconWeb3>polkadot</IconWeb3>
      </Box>
      Polkadot
    </Typography>
    <ClientMenu isKnown={isKnown}/>
  </Grid>
  );
};

export default ClientItem;
