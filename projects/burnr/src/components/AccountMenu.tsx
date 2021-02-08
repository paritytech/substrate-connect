import React, { useState, useContext } from 'react';

import { grey } from '@material-ui/core/colors';
import { Typography, makeStyles, Theme, createStyles, IconButton, Divider } from '@material-ui/core';

import { AccountContext } from '../utils/contexts';

import { openInNewTab, downloadFile, createLocalStorageAccount } from '../utils/utils';
import { POLKA_ACCOUNT_ENDPOINTS } from '../utils/constants';
import { useLocalStorage } from '../hooks';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Menu } from '@material-ui/core';
import { ListItem } from '@material-ui/core';
import { MenuItem } from '@material-ui/core';

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
	const [, setLclStorage] = useLocalStorage(minEndpoint);
	const [polkastatsUri] = useState(
		`https://${minEndpoint}.${polkastats}`
	);
	const [polkascanUri] = useState(`https://${polkascan}/${minEndpoint}`);

	const { account, setCurrentAccount } = useContext(AccountContext);

	const burnAndCreate = (): void => {
		localStorage.removeItem(minEndpoint);
		const userTmp = createLocalStorageAccount();
		setLclStorage(JSON.stringify(userTmp));
		setCurrentAccount(userTmp);
	};

	const { userAddress, userJson, userSeed } = account;

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
				onClose={handleClose}
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

				<Divider />

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
