import React, { ReactNode } from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import { Typography, Popover } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

interface Props {
  children: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
  trigger: {
    marginLeft: theme.spacing(0.5),
    '& svg' : {
      fontSize: '1em',
    },
  },
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
})
);

const PopoverInfo: React.FunctionComponent<Props> = ({ children }: Props) => {
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
      <a
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        className={classes.trigger}
      >
        <InfoOutlinedIcon color='disabled' />
      </a>

      <Popover
        onClose={handlePopoverClose}
        open={open}
        anchorEl={anchorEl}
        elevation={2}
        transitionDuration={0}
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        anchorOrigin={{
          vertical: -4,
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        marginThreshold={2}
      >
        <Typography variant='body2' component='div'>
          {children}
        </Typography>
      </Popover>
    </>
  );
};

export default PopoverInfo;
