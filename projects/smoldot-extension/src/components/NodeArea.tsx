import React, { FunctionComponent } from 'react';
import { Grid } from '@material-ui/core';
import { PolkaFont } from '../components';
import { NetworkTypes, capitalizeFirstLetter } from '../utils/utils';

interface Props {
    network: NetworkTypes;
}

const NodeArea: FunctionComponent<Props> = ({ network, children }) => (
    <Grid container item justify="center" spacing={1}>
        <Grid item xs={2}>
            <PolkaFont size={'15'}>{network}</PolkaFont>
        </Grid>
        <Grid item xs={10}>
            <h4 style={{margin: 0}}>{capitalizeFirstLetter(network)}</h4>
        </Grid>
        <Grid container item spacing={1}>
            {children}
        </Grid>
    </Grid>
);

export default NodeArea;
