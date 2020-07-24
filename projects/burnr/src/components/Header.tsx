import React from 'react';
import styled from 'styled-components';

import { AppBar, Toolbar, Typography } from '@material-ui/core';

import { theme } from '../themes';

interface Props {
  className?: string;
}

const Header: React.FunctionComponent<Props> = ({ className }: Props) => (
  <AppBar position='fixed' className={className}>
    <Toolbar>
      <Typography variant='h6' noWrap>
        Burnr
      </Typography>
    </Toolbar>
  </AppBar>
);

export default React.memo(styled(Header)`
z-index: ${theme.zIndex.drawer + 1} !important;
`);