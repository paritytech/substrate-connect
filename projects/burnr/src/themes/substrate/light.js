import { createMuiTheme }  from '@material-ui/core/styles'
import colors from './colors';

const textColor = colors.black;

const theme = createMuiTheme({
  breakpoints: {
    keys: [
      'xs',
      'sm',
      'md',
      'lg',
      'xl'
    ],
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },
  overrides: {},
  palette: {
  common: {
    black: colors.black,
    white: colors.white
  },
  type: 'light',
  background: {
    paper: colors.light.light,
    default: colors.white.dark
  },
  primary: {
    light: colors.cyan.light,
    main: colors.cyan.main,
    dark: colors.cyan.dark,
    contrastText: colors.black
  },
  secondary: {
    light: colors.pink.light,
    main: colors.pink.main,
    dark: colors.pink.dark,
    contrastText: colors.white
  },
  error: {
    light: 'rgba(247, 4, 7, 1)',
    main: 'rgba(235, 4, 7, 1)',
    dark: 'rgba(197, 5, 8, 1)',
    contrastText: colors.paper
  },
  text: {
    primary: colors.black,
    secondary: colors.dark.main,
    disabled: colors.light.dark,
    hint: colors.yellow.main,
    icon:  colors.yellow.dark
  },
  divider: colors.cyan.dark,
  action: {
    active: 'rgba(17, 17, 17, 0.8)',
    hover: 'rgba(17, 17, 17, 0.08)',
    hoverOpacity: 0.08,
    selected: 'rgba(17, 17, 17, 0.14)',
    disabled: 'rgba(17, 17, 17, 0.26)',
    disabledBackground: 'rgba(17, 17, 17, 0.12)'
  }
},
props: {},
shadows: [
  'none',
  '0px 1px 3px 0px rgba(17, 17, 17, 0.2),0px 1px 1px 0px rgba(17, 17, 17, 0.14),0px 2px 1px -1px rgba(17, 17, 17, 0.12)',
  '0px 1px 5px 0px rgba(17, 17, 17, 0.2),0px 2px 2px 0px rgba(17, 17, 17, 0.14),0px 3px 1px -2px rgba(17, 17, 17, 0.12)',
  '0px 1px 8px 0px rgba(17, 17, 17, 0.2),0px 3px 4px 0px rgba(17, 17, 17, 0.14),0px 3px 3px -2px rgba(17, 17, 17, 0.12)',
  '0px 2px 4px -1px rgba(17, 17, 17, 0.2),0px 4px 5px 0px rgba(17, 17, 17, 0.14),0px 1px 10px 0px rgba(17, 17, 17, 0.12)',
  '0px 3px 5px -1px rgba(17, 17, 17, 0.2),0px 5px 8px 0px rgba(17, 17, 17, 0.14),0px 1px 14px 0px rgba(17, 17, 17, 0.12)',
  '0px 3px 5px -1px rgba(17, 17, 17, 0.2),0px 6px 10px 0px rgba(17, 17, 17, 0.14),0px 1px 18px 0px rgba(17, 17, 17, 0.12)',
  '0px 4px 5px -2px rgba(17, 17, 17, 0.2),0px 7px 10px 1px rgba(17, 17, 17, 0.14),0px 2px 16px 1px rgba(17, 17, 17, 0.12)',
  '0px 5px 5px -3px rgba(17, 17, 17, 0.2),0px 8px 10px 1px rgba(17, 17, 17, 0.14),0px 3px 14px 2px rgba(17, 17, 17, 0.12)',
  '0px 5px 6px -3px rgba(17, 17, 17, 0.2),0px 9px 12px 1px rgba(17, 17, 17, 0.14),0px 3px 16px 2px rgba(17, 17, 17, 0.12)',
  '0px 6px 6px -3px rgba(17, 17, 17, 0.2),0px 10px 14px 1px rgba(17, 17, 17, 0.14),0px 4px 18px 3px rgba(17, 17, 17, 0.12)',
  '0px 6px 7px -4px rgba(17, 17, 17, 0.2),0px 11px 15px 1px rgba(17, 17, 17, 0.14),0px 4px 20px 3px rgba(17, 17, 17, 0.12)',
  '0px 7px 8px -4px rgba(17, 17, 17, 0.2),0px 12px 17px 2px rgba(17, 17, 17, 0.14),0px 5px 22px 4px rgba(17, 17, 17, 0.12)',
  '0px 7px 8px -4px rgba(17, 17, 17, 0.2),0px 13px 19px 2px rgba(17, 17, 17, 0.14),0px 5px 24px 4px rgba(17, 17, 17, 0.12)',
  '0px 7px 9px -4px rgba(17, 17, 17, 0.2),0px 14px 21px 2px rgba(17, 17, 17, 0.14),0px 5px 26px 4px rgba(17, 17, 17, 0.12)',
  '0px 8px 9px -5px rgba(17, 17, 17, 0.2),0px 15px 22px 2px rgba(17, 17, 17, 0.14),0px 6px 28px 5px rgba(17, 17, 17, 0.12)',
  '0px 8px 10px -5px rgba(17, 17, 17, 0.2),0px 16px 24px 2px rgba(17, 17, 17, 0.14),0px 6px 30px 5px rgba(17, 17, 17, 0.12)',
  '0px 8px 11px -5px rgba(17, 17, 17, 0.2),0px 17px 26px 2px rgba(17, 17, 17, 0.14),0px 6px 32px 5px rgba(17, 17, 17, 0.12)',
  '0px 9px 11px -5px rgba(17, 17, 17, 0.2),0px 18px 28px 2px rgba(17, 17, 17, 0.14),0px 7px 34px 6px rgba(17, 17, 17, 0.12)',
  '0px 9px 12px -6px rgba(17, 17, 17, 0.2),0px 19px 29px 2px rgba(17, 17, 17, 0.14),0px 7px 36px 6px rgba(17, 17, 17, 0.12)',
  '0px 10px 13px -6px rgba(17, 17, 17, 0.2),0px 20px 31px 3px rgba(17, 17, 17, 0.14),0px 8px 38px 7px rgba(17, 17, 17, 0.12)',
  '0px 10px 13px -6px rgba(17, 17, 17, 0.2),0px 21px 33px 3px rgba(17, 17, 17, 0.14),0px 8px 40px 7px rgba(17, 17, 17, 0.12)',
  '0px 10px 14px -6px rgba(17, 17, 17, 0.2),0px 22px 35px 3px rgba(17, 17, 17, 0.14),0px 8px 42px 7px rgba(17, 17, 17, 0.12)',
  '0px 11px 14px -7px rgba(17, 17, 17, 0.2),0px 23px 36px 3px rgba(17, 17, 17, 0.14),0px 9px 44px 8px rgba(17, 17, 17, 0.12)',
  '0px 11px 15px -7px rgba(17, 17, 17, 0.2),0px 24px 38px 3px rgba(17, 17, 17, 0.14),0px 9px 46px 8px rgba(17, 17, 17, 0.12)'
],
typography: {
  fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  display4: {},
  display3: {},
  display2: {},
  display1: {},
  headline: {
    fontSize: '1.5rem',
    fontWeight: 400,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    lineHeight: '1.35417em',
    color: textColor
  },
  title: {
    fontSize: '1.3125rem',
    fontWeight: 500,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    lineHeight: '1.16667em',
    color: textColor
  },
  subheading: {
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    lineHeight: '1.5em',
    color: textColor
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    lineHeight: '1.71429em',
    color: textColor
  },
  body1: {
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    lineHeight: '1.46429em',
    color: textColor
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    lineHeight: '1.375em',
    color: textColor
  },
  button: {
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    fontWeight: 500,
    fontFamily: '\Roboto\, \Helvetica\, \Arial\, sans-serif',
    color: textColor
  }
},
transitions: {
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.17, 17, 17.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  }
},
zIndex: {
  mobileStepper: 1000,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
}
});

export default theme;