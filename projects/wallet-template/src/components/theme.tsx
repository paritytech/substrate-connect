export const substrateGreen = {
  100: "#7E8D96",
  200: "#5CFFC8",
  300: "#18FFB2",
  400: "#16DB9A",
  500: "#11B37C",
  600: "#1A9A6C",
}

const red = {
  50: "#ffebee",
  100: "#ffcdd2",
  200: "#ef9a9a",
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  600: "#e53935",
  700: "#d32f2f",
  800: "#c62828",
  900: "#b71c1c",
  A100: "#ff8a80",
  A200: "#ff5252",
  A400: "#ff1744",
  A700: "#d50000",
}

const grey = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#d5d5d5",
  A200: "#aaaaaa",
  A400: "#303030",
  A700: "#616161",
}

const palette = {
  type: "light",
  common: {
    black: "black",
    white: "white",
  },
  background: {
    paper: "white",
    default: "white",
  },
  primary: {
    light: substrateGreen[100],
    main: substrateGreen[400],
    dark: substrateGreen[500],
    contrastText: "black",
  },
  secondary: {
    light: "#78B1D0",
    main: "#78B1D0",
    dark: "#78B1D0",
    contrastText: "#000000",
  },
  error: {
    light: red[100],
    main: "#FF3014",
    dark: red[500],
    contrastText: "black",
  },
  text: {
    primary: grey[800],
    secondary: grey[500],
    disabled: grey[300],
    hint: grey[700],
  },
  action: {
    active: substrateGreen[300],
  },
  divider: grey[200],
}

const light = {
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, Segoe UI, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Web3-Regular"',
    h1: {
      fontWeight: 500,
      fontSize: 30,
      lineHeight: "120%",
    },
    h2: {
      fontWeight: 500,
      fontSize: 20,
      lineHeight: "120%",
      letterSpacing: -0.02,
      textTransform: "capitalize",
    },
    h3: {
      fontWeight: 600,
      fontSize: 17,
      lineHeight: "120%",
    },
    h4: {
      fontWeight: 500,
      fontSize: 15,
      lineHeight: "120%",
      color: grey[800],
    },
    body1: {
      fontWeight: 400,
      fontSize: 14,
      lineHeight: "135%",
      letterSpacing: 0.15,
    },
    body2: {
      fontWeight: 400,
      fontSize: 11,
      lineHeight: "135%",
    },
    button: {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: "120%",
      letterSpacing: 0.2,
      textTransform: "none",
    },
    subtitle1: {
      fontFamily:
        "SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace",
      fontWeight: 400,
      fontSize: 20,
      lineHeight: "120%",
    },
    subtitle2: {
      fontFamily:
        "SFMono-Regular, Consolas , Liberation Mono, Menlo, monospace",
      fontWeight: 400,
      fontSize: 12,
      lineHeight: "135%",
      letterSpacing: 0.1,
    },
    overline: {
      fontSize: 11,
      lineHeight: "120%",
      letterSpacing: 0.7,
    },
  },
  palette: palette,
}

export default light
