import { ThemeOptions } from '@material-ui/core/styles';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';

// TODO this can be less lines

export const substrateGreen = {
  100: '#7E8D96',
  200: '#5CFFC8',
  300: '#18FFB2',
  400: '#16DB9A',
  500: '#11B37C',
  600: '#1A9A6C',
};
export const substrateGray = {
  100: '#F5F8FA',
  200: '#EAEEF1',
  400: '#C6D0D7',
  500: '#ABB8BF',
  600: '#7E8D95',
  800: '#323F47',
  900: '#202B33',
};

const paletteLight: PaletteOptions = {
  type: 'light',
  common: {
    black: 'black',
    white: '#FFFFFF',
  },
  background: {
    paper: '#FFFFFF',
    default: '#FFFFFF',
  },
  primary: {
    light: substrateGreen[100],
    main: substrateGreen[400],
    dark: substrateGreen[500],
    contrastText: 'black',
  },
  secondary: {
    light: substrateGreen[100],
    main: substrateGreen[400],
    dark: substrateGreen[500],
    contrastText: 'black',
  },
  error: {
    light: red[100],
    main: '#FF3014',
    dark: red[500],
    contrastText: 'black',
  },
  text: {
    primary: substrateGray[900],
    secondary: '#fff',
    disabled: grey[300],
    hint: grey[700],
  },
  action: {
    active: substrateGreen[300],
  },
  divider: grey[300],
}

const paletteDark: PaletteOptions = {
  type: 'dark',
  common: {
    black: 'black',
    white: '#FFFFFF',
  },
  background: {
    paper: substrateGray[800],
    default: 'black',
  },
  primary: {
    light: substrateGreen[100],
    main: substrateGreen[400],
    dark: substrateGreen[500],
    contrastText: 'black',
  },
  secondary: {
    light: substrateGreen[100],
    main: substrateGreen[400],
    dark: substrateGreen[500],
    contrastText: 'black',
  },
  error: {
    light: red[100],
    main: '#FF3014',
    dark: red[500],
    contrastText: 'black',
  },
  text: {
    primary: substrateGray[200],
    secondary: substrateGray[600],
    disabled: grey[300],
    hint: grey[300],
  },
  action: {
    active: substrateGreen[300],
  },
  divider: grey[600],
}

const light: ThemeOptions = {
  typography: {
    allVariants: {
      color: paletteLight.text && paletteLight.text.primary,
    },
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, Segoe UI, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Web3-Regular"',
    h1: {
      fontWeight: 500,
      fontSize: 30,
      lineHeight: '115%',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: 21,
      lineHeight: '120%',
    },
    h3: {
      fontWeight: 600,
      fontSize: 18,
      lineHeight: '120%',
    },
    h4: {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '120%',
      color: grey[800],
    },
    body1: {
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '140%',
      color: grey[800],
    },
    body2: {
      fontWeight: 400,
      fontSize: 12,
      lineHeight: '135%',
      letterSpacing: 0.25,
    },
    button: {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '120%',
      letterSpacing: 0.2,
      textTransform: 'none',
    },
    subtitle1: {
      fontFamily: 'SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace',
      fontWeight: 400,
      fontSize: 20,
      lineHeight: '120%',
    },
    subtitle2: {
      fontFamily: 'SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace',
      fontWeight: 400,
      fontSize: 12,
      lineHeight: '135%',
      color: grey[700],
      letterSpacing: 0.1,
    },
    overline: {
      fontSize: 11,
      lineHeight: '120%',
      letterSpacing: 0.7,
    },
  },
  palette: paletteLight
};
export default light;

export const dark: ThemeOptions = {
  typography: {
    allVariants: {
      color: paletteDark.text && paletteDark.text.primary,
    },
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, Segoe UI, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Web3-Regular"',
    h1: {
      fontWeight: 500,
      fontSize: 30,
      lineHeight: '115%',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: 21,
      lineHeight: '120%',
      color: grey[200],
    },
    h3: {
      fontWeight: 600,
      fontSize: 18,
      lineHeight: '120%',
    },
    h4: {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '120%',
      color: grey[400],
    },
    body1: {
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '140%',
      color: grey[200],
    },
    body2: {
      fontWeight: 400,
      fontSize: 12,
      lineHeight: '135%',
      letterSpacing: 0.25,
    },
    button: {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '120%',
      letterSpacing: 0.2,
      textTransform: 'none',
    },
    subtitle1: {
      fontFamily: 'SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace',
      fontWeight: 400,
      fontSize: 20,
      lineHeight: '120%',
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
      lineHeight: '120%',
      letterSpacing: 0.7,
    },
  },
  palette: paletteDark
};
