import React from 'react';
import { makeStyles, Typography, Box, ButtonBase, Grid, Menu, MenuItem } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { IconWeb3 } from '../components';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
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
}));

const ClientMenu: React.FunctionComponent = ({children}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <ButtonBase 
				onClick={handleClick}
				disableRipple
			>
				<ExpandMore fontSize='small' />
			</ButtonBase>
			
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
				<Typography variant='overline'>Chainspec</Typography>
        <MenuItem>Input: File</MenuItem>
        <MenuItem>Input: DisplayName</MenuItem>
      </Menu>
    </>
  );
}


const ClientItem: React.FunctionComponent = () => {
	const classes = useStyles();

	return (
    <Grid container wrap='nowrap' justify='space-between'>
    <Typography variant='h2' component='div'>
      <Box component='span' className={classes.networkIconRoot}>
          <IconWeb3>polkadot</IconWeb3>
      </Box>
      Polkadot
    </Typography>
    <ClientMenu />
  </Grid>
	);
};

export default ClientItem;
