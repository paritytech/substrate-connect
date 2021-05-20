import { InputBase, ButtonBase, Box, Button, Input } from '@material-ui/core';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

/**
 * `InputWrap` is used to wrap `InputText` and `InputButton`
 *
 * API:
 *
 * - [Box](https://material-ui.com/components/box/)
 * 
 */
export const InputWrap = withStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'nowrap',
      marginLeft: -2,
      backgroundColor: grey[100],
      borderRadius: theme.spacing(0.5),
      border: `1px solid ${grey[200]}`,
    },
  })
)(Box);


/**
 * `InputText` is used inside `InputWrap` next to `InputButton`
 *
 * API:
 *
 * - [InputBase API](https://material-ui.com/api/input-base/)
 * 
 */
export const InputText = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      '& input': {
        padding: theme.spacing(1),
      },
    },
  })
)(InputBase);

/**
 * TODO: make select
 * `InputSelect` is used inside `InputWrap` next to `InputButton`
 *
 * API:
 *
 * - [InputBase API](https://material-ui.com/api/input-base/)
 * 
 */
export const InputSelect = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      background: 'white',
      '& input': {
        padding: theme.spacing(1),
      },
    },
  })
)(InputBase);

/**
 * `InputButton` is used inside `InputWrap` next to `InputText`
 *
 * API:
 *
 * - [ButtonBase API](https://material-ui.com/api/button-base/)
 * 
 */
export const InputButton = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderTopRightRadius: theme.spacing(0.5),
      borderBottomRightRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.default,
      paddingLeft: theme.spacing(1.2),
      paddingRight: theme.spacing(1.2),
    },
  })
)(ButtonBase);

/**
 * `MenuButton` is used in menus with multiple text buttons
 *
 * API:
 *
 * - [Button API](https://material-ui.com/api/button-base/)
 * 
 */
export const MenuButton = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: `${theme.spacing()}px ${theme.spacing(3)}px`,
      borderRadius: 0,
      transition: `backgrund-color 0s !important`,
      ...theme.typography.body1,
      '&.danger': {
        color: theme.palette.error.main,
      },
      '& .MuiButton-label': {
        justifyContent: 'space-between',
      },
      '& svg': {
        color: theme.palette.text.secondary,
      },
    },
  })
)(Button);

export const MenuInputText = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:before': {
        borderBottomColor: theme.palette.divider
      }
    },
  })
)(Input);
