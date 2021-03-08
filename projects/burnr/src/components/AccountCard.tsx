import React, { useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import { Typography, Grid, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { Account } from '../utils/types';
import { copyToClipboard } from '../utils/utils';

interface Props {
  account: Account;
  addressFormat?: 'Full' | 'Short';
}

const Alert = (props: AlertProps) => {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const AccountCard: React.FunctionComponent<Props> = ({ account, addressFormat }: Props) => {
	const [showCopied, setShowCopied] = useState<boolean>(false);
	console.log('account.address', account.address);
	console.log('account.name', account.name);
	return (
		<Grid container wrap='nowrap' spacing={1} alignItems='center'>
			<Grid item>
				<Identicon
					size={32}
					theme='polkadot'
					value={account.address}
					onCopy={() => {
						setShowCopied(true);
						copyToClipboard(account.address);
					}}
				/>
				<Snackbar
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					open={showCopied}
					autoHideDuration={2000}
					onClose={() => setShowCopied(false)}>
					<Alert severity="success">Copied!</Alert>
				</Snackbar>
			</Grid>
			<Grid item>
				{ account.name !== '' &&
			<Typography variant='h4'>
				{account.name}
			</Typography>
				}
				<Typography variant='subtitle2'>
					{ addressFormat === 'Full'
						? account.address
						: account.address.slice(0,4) + '...' + account.address.slice(account.address.length - 4, account.address.length)
					}
				</Typography>
			</Grid>
		</Grid>
	);};

export default AccountCard;
