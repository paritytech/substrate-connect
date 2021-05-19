import React from 'react';

import { IconButton, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import CachedIcon from '@material-ui/icons/Cached';
import CheckIcon from '@material-ui/icons/Check';
import ErrorIcon from '@material-ui/icons/Error';

import { ExtrinsicInfo } from '../utils/types';

const useStyles = makeStyles((theme: Theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(-0.5),
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
})
);

// @TODO blockexplorer links

const PopoverExtrinsic: React.FunctionComponent<ExtrinsicInfo> = ({ status }: ExtrinsicInfo) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {status === 0 && <CachedIcon color='disabled' />}
        {status === 1 && <CheckIcon color='action' />}
        {status === 2 && <ErrorIcon color='error' />}
        {status === 3 && <CircularProgress />}

      </IconButton>
      <Popover
        elevation={2}
        transitionDuration={0}
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography variant='body2'>
          The content of the Popover, link to BlockExplorers
        </Typography>
      </Popover>
    </>
  );
};

export default PopoverExtrinsic;
