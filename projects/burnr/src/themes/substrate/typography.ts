import { ThemeOptions } from '@material-ui/core/styles';

const typography: ThemeOptions = {
  typography: {
    fontFamily: 'Inter, Helvetica, Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: 30,
      lineHeight: '120%',
    },
    h2: {
      fontWeight: 400,
      fontSize: 22,
      lineHeight: '120%',
      letterSpacing: 0.25,
    },
    h3: {
      fontWeight: 600,
      fontSize: 20,
      lineHeight: '120%',
    },
    h4: {
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '120%',
    },
    body1: {
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '120%',
      letterSpacing: 0.15,
    },
    body2: {
      fontWeight: 400,
      fontSize: 12,
      lineHeight: '120%',
      letterSpacing: 0.25,
    },
    button: {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '140%',
      letterSpacing: 0.2,
      textTransform: 'none',
    },
    subtitle1: {
      fontFamily: 'SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace',
      fontWeight: 400,
      fontSize: 17,
      lineHeight: '200%',
    },
    subtitle2: {
      fontFamily: 'SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace',
      fontWeight: 400,
      fontSize: 13,
      lineHeight: '135%',
      letterSpacing: 0.1,
    },
    overline: {
      fontSize: 11,
      letterSpacing: 0.7,
    },
  },
};
export default typography;
