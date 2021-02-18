import React from 'react';
import { makeStyles, Theme, Typography, Box, ButtonBase, ButtonGroup, Grid, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { IconWeb3 } from '../components';
import { ExpandMore, SystemUpdateAlt } from '@material-ui/icons';

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
}));

const ClientMenu: React.FunctionComponent<Props> = ({isKnown}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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
