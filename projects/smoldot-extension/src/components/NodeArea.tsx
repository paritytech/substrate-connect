import React, { FunctionComponent } from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { PolkaFont } from '../components';
import { NetworkTypes, capitalizeFirstLetter } from '../utils/utils';

interface Props {
    network: NetworkTypes;
}

const NodeArea: FunctionComponent<Props> = ({ network, children }) => (
    <>
        <Box mb={1} mt={1}>
            <Typography variant='h4' gutterBottom>
                <PolkaFont>{network}</PolkaFont>
                {capitalizeFirstLetter(network)}
            </Typography>
            {children}
        </Box>
        <Divider />
    </>
);

export default NodeArea;
