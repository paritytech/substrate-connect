import React, { useContext } from 'react';

import { AccountContext } from '../utils/contexts';

import QRCode from 'qrcode.react';
import { makeStyles, createStyles, Theme, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		container: {
			marginTop: theme.spacing(3),
		},
		formSubmitContainer: {
			display: 'flex',
			marginTop: theme.spacing(3),
			alignContent: 'center',
            justifyContent: 'center',
		}
	})
);
  

const ReceiveFundsForm: React.FunctionComponent = () => {
    const { account } = useContext(AccountContext);
	const classes = useStyles();
	return (
		<Grid
			component='form'
			container
			direction='column'
			className={classes.container}
		>
			<Grid
				item
				xs={12}
				className={classes.formSubmitContainer}
			>
				<QRCode
                    value={account.userAddress}
                    size={512}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    includeMargin={true}
                    renderAs={"svg"}
                />
			</Grid>
		</Grid>
	);
};

export default ReceiveFundsForm;
