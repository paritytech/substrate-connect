import React, { ReactNode } from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import { IconButton, Typography, Popover, Box } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

interface Props {
  children: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		display: 'inline-block',
	},
	popover: {
		pointerEvents: 'none',
	},
	paper: {
		padding: theme.spacing(1),
		marginTop: theme.spacing(-0.5),
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
})
);

const PopoverInfo: React.FunctionComponent<Props> = ({ children }: Props) => {
	const classes = useStyles();
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<Box className={classes.root}>
			<IconButton
				onMouseEnter={handlePopoverOpen}
				onMouseLeave={handlePopoverClose}
			>
				<InfoIcon fontSize='small' />
			</IconButton>

			<Popover
				onClose={handlePopoverClose}
				open={open}
				anchorEl={anchorEl}

				elevation={2}
				transitionDuration={0}
				className={classes.popover}
				classes={{
					paper: classes.paper,
				}}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
			>
				<Typography variant='body2' component='div'>
					{children}
				</Typography>
			</Popover>
		</Box>
	);
};

export default PopoverInfo;
