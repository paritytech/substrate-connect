import React, { useContext } from 'react';

import { Box } from '@material-ui/core';
import QRCode from 'qrcode.react';
import { AccountContext } from '../utils/contexts';

const ReceiveFundsForm: React.FunctionComponent = () => {
  const { account } = useContext(AccountContext);
  return (
    <Box display='flex' justifyContent='center'>
      <QRCode
        value={account.userAddress}
        size={400}
        includeMargin={true}
      />
    </Box>
  );
};

export default ReceiveFundsForm;
