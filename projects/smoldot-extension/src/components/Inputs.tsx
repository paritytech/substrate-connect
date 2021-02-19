import { InputBase, ButtonBase, Box } from '@material-ui/core';
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
