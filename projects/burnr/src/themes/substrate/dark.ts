import { ThemeOptions } from '@material-ui/core/styles';
import colors from './colors';
import typography from './typography';
import shadows from './shadows';
import { grey } from '@material-ui/core/colors';

const dark: ThemeOptions = {
  typography: typography.typography,
  shadows: shadows.shadows,
  palette: {
    type: 'dark',
    common: {
      black: colors.black,
      white: colors.white,
    },
    background: {
      paper: '#21262A',
      default: colors.dark.dark,
    },
    primary: {
      light: colors.substrate.dark,
      main: colors.cyan.main,
      dark: colors.cyan.dark,
      contrastText: colors.black,
    },
    secondary: {
      light: colors.pink.light,
      main: '#FFFFFF',
      dark: '#FF3014',
      contrastText: colors.white,
    },
    error: {
      light: 'rgba(247, 4, 7, 1)',
      main: 'rgba(235, 4, 7, 1)',
      dark: 'rgba(197, 5, 8, 1)',
      contrastText: colors.paper,
    },
    text: {
      primary: colors.white,
      secondary: colors.light.main,
      disabled: colors.dark.light,
      hint: colors.yellow.main,
    },
    divider: grey[800],
  },
};

export default dark;
