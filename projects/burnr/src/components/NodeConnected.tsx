/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useEffect } from 'react';

import { createStyles, makeStyles, Theme  } from '@material-ui/core/styles';
import { Typography, Box } from '@material-ui/core';
import { ApiPromise } from '@polkadot/api';

import { ALL_PROVIDERS, BURNR_WALLET } from '../utils/constants';
import { useApi } from '../hooks';
import { logger } from '@polkadot/util';

import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nodeSelectorWrap: {
      position: 'relative',
      height: '60px',
      borderTopRightRadius: theme.spacing(0.5),
      borderTopLeftRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.paper,
    },
    nodeSelectorInner: {
      position: 'absolute',
      zIndex: theme.zIndex.modal,
      width: '100%',
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.paper,
      '&.open': {
        boxShadow: theme.shadows[2],
      },
    },
    nodeDesc: {
      paddingLeft: theme.spacing(1),
    }
  })
);

export interface Option {
  network: string;
  client: string | undefined;
  provider: string;
}

type colorType = 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error';

export default function NodeConnected(): React.ReactElement {
  const l = logger(BURNR_WALLET);
  const classes = useStyles();
  const api = useApi();
  const [fiberColor, setFiberColor] = useState<colorType>('error');

  useEffect(() => {
    const getColor = async (api: ApiPromise) => {
      if (api && await api.isReady) {
        setFiberColor('primary');
        l.log("Burnr wallet is now connected to", ALL_PROVIDERS.network);
      }
    }

    api && getColor(api);
  }, [api, l]);

  return (
    <div className={classes.nodeSelectorWrap}>
      <div className={classes.nodeSelectorInner}>
        <Box display='flex' alignItems='center' pt={2.5} pb={2.5} pl={2.5} pr={2.5}>
          <FiberManualRecordIcon style={{ fontSize: '16px', marginRight: 4 }} color={fiberColor} />
          <Box width='100%' display='flex' alignItems='baseline'>
            <Typography variant='h4'>{ ALL_PROVIDERS.network }</Typography>
            <Typography variant='body2' className={classes.nodeDesc} color='textSecondary'>{ALL_PROVIDERS.client}</Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
}
