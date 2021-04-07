import * as React from 'react';
import { Divider } from '@material-ui/core';
import { SystemUpdateAlt } from '@material-ui/icons';
import { InputButton, InputText, InputWrap } from '../components';

const ClientSearch: React.FunctionComponent = () => {
  return (
    <InputWrap>
      <InputText placeholder='Search by network, uApp or url' />
      <Divider orientation='vertical' flexItem/>
      <InputButton>
        <SystemUpdateAlt fontSize='small' />
      </InputButton>
    </InputWrap>
  );
};

export default ClientSearch;
