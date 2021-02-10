import React from 'react';
import Identicon from '@polkadot/react-identicon';

import { Typography, Grid } from '@material-ui/core';

import { Account } from '../utils/types';

interface Props {
  account: Account;
  addressFormat?: 'Full' | 'Short';
}

const AccountCard: React.FunctionComponent<Props> = ({ account, addressFormat }: Props) => {
	return (
		<Grid container wrap='nowrap' spacing={1} alignItems='center'>
			<Grid item>
				<Identicon
					size={32}
					theme='polkadot'
					value={account.address}
				/>
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
