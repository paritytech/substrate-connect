import React from 'react';

import { createStyles,fade, makeStyles, Theme  } from '@material-ui/core/styles';
import { Typography, ButtonBase, InputBase } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Autocomplete, { AutocompleteCloseReason } from '@material-ui/lab/Autocomplete';

import { NodeSelectorItem, NodeSelectorSelected, NodeInfo } from '.';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		wrapper: {
			position: 'relative',
			height: '60px',
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.spacing(0.5),
		},
		root: {
			position: 'absolute',
			zIndex: theme.zIndex.modal,
			width: '100%',
			padding: theme.spacing(1),
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.spacing(0.5),
			'&#node-selector': {
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
				backgroundColor: theme.palette.primary.main,
				color: theme.palette.getContrastText(theme.palette.primary.main),
			},
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
	const id = open ? 'node-selector' : undefined;

	return (
		<div className={classes.wrapper}>
			<div className={classes.root} id={id}>
				<ButtonBase
					disableRipple
					className={classes.button}
					onClick={handleOpenDropdown}
				>
					<NodeSelectorSelected node={value}/>
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
						options={labels}
						disablePortal={true}
						getOptionLabel={(option) => option.providerName + option.networkName}
						open
						classes={{
							popper: classes.acPopper,
							option: classes.option,
							paper: classes.acPaper,
						}}

						onClose={handleClose}
						onChange={(event, newValue) => {
							if (newValue == null || newValue == value || typeof newValue == 'string') {
								return;
							}
							setValue(newValue);
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
							<NodeSelectorItem node={option} selected={option == value} />
						)}
						groupBy={(option) => option.networkName}
					/>
				</>
				}

			</div>
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
