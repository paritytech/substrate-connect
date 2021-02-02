import React, { useState, ChangeEvent } from 'react';

import { createStyles,fade, makeStyles, Theme  } from '@material-ui/core/styles';
import { Typography, ButtonBase, InputBase } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Autocomplete, { AutocompleteCloseReason } from '@material-ui/lab/Autocomplete';

import { ALL_PROVIDERS } from '../utils/constants';
import { useApiCreate, useLocalStorage } from '../hooks';
import { NodeSelectorItem, NodeSelectorSelected } from '../components';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrapper: {
			position: 'relative',
			height: '60px',
			backgroundColor: theme.palette.background.paper,
			borderTopRightRadius: theme.spacing(0.5),
			borderTopLeftRadius: theme.spacing(0.5),
		},
		root: {
			position: 'absolute',
			zIndex: theme.zIndex.modal,
			width: '100%',
			padding: theme.spacing(1),
			paddingTop: theme.spacing(1.5),
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.spacing(0.5),
			'&.node-selector': {
				boxShadow: theme.shadows[2],
			},
		},
		button: {
			width: '100%',
			textAlign: 'left',
		},
		popper: {
			position: 'relative',
			width: '100%',
			transform: 'none !important',
			boxShadow: 'none',
		},
		acHeader: {
			paddingTop: theme.spacing(1),
			paddingLeft: theme.spacing(3),
			paddingRight: theme.spacing(3),
		},
		acInput: {
			width: '100%',
			'& input': {
				borderRadius: theme.spacing(0.5),
				padding: theme.spacing(1),
				border: '1px solid',
				'&:focus': {
					boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
					borderColor: theme.palette.primary.main,
				},
			},
		},
		acPopper: {
			position: 'relative',
		},
		acPaper: {
			margin: 0,
			boxShadow: 'none',
			backgroundColor: 'rgba(0,0,0,0)',
			'& .MuiListSubheader-root': {
				paddingLeft: theme.spacing(3),
				paddingRight: theme.spacing(3),
				fontSize: theme.typography.h4.fontSize,
				lineHeight: theme.spacing(5) + 'px',
			},
		},
		option: {
			paddingLeft: theme.spacing(1) + 'px !important',
			paddingRight: theme.spacing(1) + 'px !important',
			borderRadius: theme.spacing(0.5),
			height: theme.spacing(5),
			'&:hover': {
				backgroundColor: theme.palette.primary.dark,
				color: theme.palette.getContrastText(theme.palette.primary.main),
			},
		},
	})
);

export interface Option {
  network: string;
	client: string|undefined;
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

export default function NodeSelector() {
	const classes = useStyles();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [localEndpoint, setLocalEndpoint] = useLocalStorage('endpoint');
  const endpointName = localEndpoint || 'Polkadot-WsProvider'
	const [provider, setProvider] = useState<string>(ALL_PROVIDERS[endpointName].id);
  const handleOpenDropdown = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = (event: ChangeEvent<{}>, reason: AutocompleteCloseReason) => {
		if (reason === 'toggleInput') {
			return;
		}
		setAnchorEl(null);
	};

	const updateProvider = (provider: string) => {
		setLocalEndpoint(provider);
		setProvider(provider);
		
		console.log("Burnr wallet is now connected to", ALL_PROVIDERS[provider].endpoint);
		// Tis is just a temporary work around. Api should be passed on as prop without reload
		location.reload();
		// setChain(REMOTE_PROVIDERS[selectedEndpoint].network);
	};

	const open = Boolean(anchorEl);

	return (
		<div className={classes.wrapper}>
			<div className={classes.root + (open ? ' node-selector' : '')}>
				<ButtonBase
					disableRipple
					className={classes.button}
					onClick={handleOpenDropdown}
				>
					<NodeSelectorSelected provider={ALL_PROVIDERS[provider]}/>
					<ArrowDropDownIcon />
				</ButtonBase>

				{ open &&
				<>
					<Typography
						variant='overline'
						color='textSecondary'
						className={classes.acHeader}
						component='div'
					>
						Select node provider
					</Typography>

					<Autocomplete
						options={options}
						disablePortal={true}
						getOptionLabel={(option) => `${option.client} client`}
						open
						classes={{
							popper: classes.acPopper,
							option: classes.option,
							paper: classes.acPaper,
						}}
						onClose={handleClose}
						onChange={(event: ChangeEvent<{}>, {provider: selected}: any ) => {
							updateProvider(selected);
						}}

						renderInput={(params) => (
							<InputBase
								ref={params.InputProps.ref}
								inputProps={params.inputProps}
								autoFocus
								className={classes.acInput}
							/>
						)}
						renderOption={(option) => (
							<NodeSelectorItem provider={option} selected={option.provider === provider} />
						)}
						groupBy={(option) => option.network}
					/>
				</>
				}

			</div>
		</div>
	);
}
