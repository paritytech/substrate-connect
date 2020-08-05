import React from 'react';

import { Grid,Typography, ButtonBase, InputBase, Popper } from '@material-ui/core';
import { createStyles,fade, makeStyles, Theme  } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import DoneIcon from '@material-ui/icons/Done';
import Autocomplete, { AutocompleteCloseReason } from '@material-ui/lab/Autocomplete';

import NodeSelectorSelected from './NodeSelectorSelected';
import { NodeInfo } from './types';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			position: 'relative',
		},
		button: {
			width: '100%',
			textAlign: 'left',
			paddingLeft: theme.spacing(1),
			paddingRight: theme.spacing(1),
		},
		popper: {
			width: '100%',
		},
		header: {
			paddingLeft: theme.spacing(2) + 'px !important',
			paddingRight: theme.spacing(2) + 'px !important',
			paddingTop: theme.spacing(2) + 'px !important',
			backgroundColor: theme.palette.background.paper,
		},
		inputBase: {
			width: '100%',
			paddingLeft: theme.spacing(2) + 'px !important',
			paddingRight: theme.spacing(2) + 'px !important',
			backgroundColor: theme.palette.background.paper,
			'& input': {
				borderRadius: 4,
				padding: theme.spacing(1),
				border: '1px solid',
				'&:focus': {
					boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
					borderColor: theme.palette.primary.main,
				},
			},
		},
		option: {
			padding: theme.spacing(2) + 'px !important',
			'&:hover': {
				backgroundColor: theme.palette.primary.main,
				color: theme.palette.common.white,
			},
		},
		text: {
			flexGrow: 1,
		},
	})
);

export default function NodeSelector() {
	const classes = useStyles();

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [value, setValue] = React.useState<NodeInfo>(labels[1]);

	const handleOpenDropdown = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = (event: React.ChangeEvent<{}>, reason: AutocompleteCloseReason) => {
		if (reason === 'toggleInput') {
			return;
		}
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<div className={classes.root}>
			<ButtonBase
				disableRipple
				className={classes.button}
				onClick={handleOpenDropdown}
			>
				<NodeSelectorSelected node={value}/>
				<ArrowDropDownIcon />
			</ButtonBase>

			<Popper
				open={open}
				anchorEl={anchorEl}
				placement="bottom-start"
				disablePortal={true}
				className={classes.popper}
			>
				<div className={classes.header}>
					<Typography variant='overline' color='textSecondary'>
						Select node provider
					</Typography>
				</div>

				<Autocomplete
					options={labels}
					getOptionLabel={(option) => option.providerName + option.networkName}
					open
					classes={{
						option: classes.option,
					}}

					onClose={handleClose}
					onChange={(event, newValue) => {
						if (newValue == null || newValue == value || typeof newValue == 'string') {
							return;
						}
						setValue(newValue);
					}}
					renderOption={(option) => (
						<Grid
							container
							alignItems='center'
							wrap='nowrap'
						>
							<Grid item xs={12}>
								{option.providerName}
							</Grid>
							<Grid item>
								{ option == value && <DoneIcon/> }
							</Grid>
						</Grid>
					)}
					renderInput={(params) => (
						<InputBase
							ref={params.InputProps.ref}
							inputProps={params.inputProps}
							autoFocus
							className={classes.inputBase}
						/>
					)}

					groupBy={(option) => option.networkName}
				/>
			</Popper>
		</div>
	);
}

const labels = [
	{
		networkName: 'Westend',
		providerName: 'Parity',
	},
	{
		networkName: 'Kusama',
		providerName: 'Parity',
	},
	{
		networkName: 'Kusama',
		providerName: 'Web3',
	},
	{
		networkName: 'Polkadot',
		providerName: 'Parity',
	},
	{
		networkName: 'Polkadot',
		providerName: 'Web3',
	}
];
