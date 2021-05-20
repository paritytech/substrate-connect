import React, { useState, ChangeEvent } from 'react';

import { createStyles, makeStyles, Theme  } from '@material-ui/core/styles';
import { InputBase, ClickAwayListener,  Typography, Box } from '@material-ui/core';
import Autocomplete, { AutocompleteCloseReason } from '@material-ui/lab/Autocomplete';

import { ALL_PROVIDERS } from '../utils/constants';
import { useLocalStorage, useApi } from '../hooks';

import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import DoneIcon from '@material-ui/icons/Done';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nodeSelectorWrap: {
      position: 'relative',
      height: '60px',
      borderTopRightRadius: theme.spacing(0.5),
      borderTopLeftRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.paper,
    },
    nodeSelectorInner: {
      position: 'absolute',
      zIndex: theme.zIndex.modal,
      width: '100%',
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.paper,
      '&.open': {
        boxShadow: theme.shadows[2],
      },
    },
    autocompleteInput: {
      '& input': {
        padding: theme.spacing(),
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
        borderRadius: theme.spacing(),
        border: `1px solid ${theme.palette.divider}`,
      },
    },
    autocompletePopper: {
      position: 'relative',
    },
    autocompleteOption: {
      display: 'flex',
      justifyContent: 'space-between',
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
      borderRadius: theme.spacing(),
    },
  })
);

export interface Option {
  network: string;
  client: string | undefined;
  provider: string;
}

const options = Object.entries(ALL_PROVIDERS).map(
  ([provider, settings]): Option => (
      {  
        network: settings.network,
        client: settings.client,
        provider
      }
  )
).sort((a,b) => (a.network > b.network) ? 1 : ((b.network > a.network) ? -1 : 0));

export default function NodeSelector(): React.ReactElement {
  const classes = useStyles();
  const api = useApi();
  const [localEndpoint, setLocalEndpoint] = useLocalStorage('endpoint');
  const endpointName = localEndpoint || 'Polkadot-WsProvider'
  const [provider, setProvider] = useState<string>(ALL_PROVIDERS[endpointName].id);
  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleClose = (event?: ChangeEvent<unknown>, reason?: AutocompleteCloseReason) => {
    if (reason === 'toggleInput') {
      return;
    }
    setOpen(false);
  };

  const updateProvider = (provider: string) => {
    setLocalEndpoint(provider);
    setProvider(provider);
    
    console.log("Burnr wallet is now connected to", ALL_PROVIDERS[provider].endpoint);
    // Tis is just a temporary work around. Api should be passed on as prop without reload
    location.reload();
    // setChain(REMOTE_PROVIDERS[selectedEndpoint].network);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>    
      <div className={classes.nodeSelectorWrap}>
        <div className={`${classes.nodeSelectorInner} ${open ? 'open' : ''}`}>

          <Box display='flex' alignItems='center' pt={1.5} pb={1.5} pl={0.5} pr={0.5} onClick={toggleOpen}>
            <FiberManualRecordIcon style={{ fontSize: '16px', marginRight: 4 }} color={api && api.isReady ? 'primary' : 'error'} />
            <Box width='100%'>
              <Typography variant='h4'>{ ALL_PROVIDERS[provider].network }</Typography>
              <Typography variant='body2' color='textSecondary'>{ALL_PROVIDERS[provider].client} client</Typography>
            </Box>
            {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon /> }
          </Box>

          {open &&
            <Autocomplete
              open
              options={options}
              classes={{
                option: classes.autocompleteOption,
                popper: classes.autocompletePopper,
              }}
              renderOption={(option) => (
                <>
                  {option.network}
                  <DoneIcon
                    fontSize='small'
                    style={{
                      visibility: option.provider === provider ? 'visible' : 'hidden'
                    }} />
                </>
              )}
              getOptionLabel={(option) => option.network}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(event: ChangeEvent<unknown>, {provider: selected}: any ) => {
                updateProvider(selected)
              }}
              disablePortal={true}
              renderInput={(params) => (
                <InputBase
                  ref={params.InputProps.ref}
                  inputProps={params.inputProps}
                  autoFocus
                  className={classes.autocompleteInput}
                  fullWidth
                  placeholder='select node provider'
                />
              )}
            />
          }

        </div>
      </div>
    </ClickAwayListener>
  );
}
