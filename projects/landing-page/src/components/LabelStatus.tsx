import * as React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const useStyles = makeStyles(theme => ({
  root: {
    width: '345px !important',
    paddingLeft: theme.spacing(10),
  },
}));

interface StatusProps {
  status: 'supported' | 'soon' | 'very soon';
}
const LabelStatus: React.FunctionComponent<StatusProps> = ({status}) => {
  const classes = useStyles();
  return (
    <Button className={`${classes.root} ${status}`} variant='contained' disabled startIcon={<FiberManualRecordIcon />}>
      {status}
    </Button>
  )
};

export default LabelStatus;
