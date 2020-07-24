import React from 'react';
import styled from 'styled-components';
import Identicon from '@polkadot/react-identicon';

import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';

import { Account } from '../utils/types';

interface Props {
  account: Account;
  className?: string;
}

/**
 * Example: 
 * Styled FunctionComponent as constant.
 */

const AccountCard: React.FunctionComponent<Props> = ({ account, className }: Props) => (
  <Card className={className}>
    <CardHeader className="header" title={`Account: ${account.name}`} />
    <CardContent>
      <Identicon
          size={24}
          theme='polkadot'
          value={account.address}
        />
        <Typography variant="subtitle1">{account.address}</Typography>
    </CardContent>
  </Card>
);

export default React.memo(styled(AccountCard)`
.header {
 /** Styles go in here **/
}
`);