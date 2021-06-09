import React, { useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import { Typography, Snackbar, Box } from '@material-ui/core';
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
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}>
        <Alert severity="success">Copied!</Alert>
      </Snackbar>
      
      <Box display='flex' alignItems='center'>
        <Identicon
          size={32}
          theme='polkadot'
          value={account.address}
          onCopy={() => {
            setShowCopied(true);
            copyToClipboard(account.address);
          }}
        />
        <Box height={32} display='flex' flexDirection='column' justifyContent='center' ml={1}>
          { account.name !== '' && <Typography variant='h4'>{account.name}</Typography>}
          <Typography variant='subtitle2'>
            { addressFormat === 'Full'
              ? account.address
              : account.address.slice(0,4) + '...' + account.address.slice(account.address.length - 4, account.address.length)
            }
          </Typography>
        </Box>
      </Box>
    </>
  );};

export default AccountCard;
