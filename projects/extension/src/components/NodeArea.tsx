import React, { FunctionComponent } from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { IconWeb3 } from '../components';
import { NetworkTypes } from '../types';
import { capitalizeFirstLetter } from '../utils/utils';

interface Props {
    network: NetworkTypes;
}

const NodeArea: FunctionComponent<Props> = ({ network, children }) => (
    <>
        <Box mb={1} mt={1}>
            <Typography variant='h4' gutterBottom>
                <IconWeb3>{network}</IconWeb3>
                {capitalizeFirstLetter(network)}
            </Typography>
            {children}
        </Box>
        <Divider />
    </>
);

export default NodeArea;
