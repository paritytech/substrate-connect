import React, { useState, useContext } from 'react';

import { grey } from '@material-ui/core/colors';
import { Typography, makeStyles, Theme, createStyles, IconButton, ListItem, Menu, MenuItem } from '@material-ui/core';
import { BurnrDivider } from '../components';

import { AccountContext } from '../utils/contexts';
import { openInNewTab, downloadFile } from '../utils/utils';
import { POLKA_ACCOUNT_ENDPOINTS } from '../utils/constants';
import { useLocalStorage } from '../hooks';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menu: {
      '& .MuiListItem-dense:focus': {
        outline: 'transparent !important',
      },
      '& hr': {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        backgroundColor: theme.palette.grey[200],
      }
    }
  })
);

const { polkastats, polkascan } = POLKA_ACCOUNT_ENDPOINTS;

const AccountMenu: React.FunctionComponent = () => {
  const classes = useStyles();
  const [endpoint] = useLocalStorage('endpoint');
  const minEndpoint = endpoint?.split('-')[0]?.toLowerCase();
  const [polkastatsUri] = useState(
    `https://${minEndpoint}.${polkastats}`
  );
  const [polkascanUri] = useState(`https://${polkascan}/${minEndpoint}`);
  const { account } = useContext(AccountContext);
  const { userAddress, userJson, userSeed } = account;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  return (
    <>
      <IconButton onClick={handleClick}>
        <ExpandMoreIcon style={{color: grey[500]}}/>
      </IconButton>

      <Menu
        transformOrigin={{vertical: -40, horizontal: 'left'}}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        className={classes.menu}
      >
        <ListItem dense autoFocus={false} selected={false}>
          <Typography variant='overline'>
            Block explorers
          </Typography>
        </ListItem>

        <MenuItem onClick={() => openInNewTab(polkascanUri)}>
          Polkascan
        </MenuItem>
        <MenuItem onClick={() => openInNewTab(polkastatsUri)}>
          Polkastats
        </MenuItem>

        <BurnrDivider />

        <ListItem dense>
          <Typography variant='overline'>
            Export
          </Typography>
        </ListItem>

        <MenuItem onClick={() => downloadFile(userAddress, JSON.stringify(userJson), 'json')}>
          JSON file
        </MenuItem>
        <MenuItem onClick={() => downloadFile(userAddress, userSeed, 'txt')}>
          Seed Phrase
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountMenu;
