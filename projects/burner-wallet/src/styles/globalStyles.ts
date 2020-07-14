import { createGlobalStyle } from 'styled-components';

import RobotoMono_WOFF from 'fonts/RobotoMono/RobotoMono-Regular.woff2';
import RobotoMono_TTF from 'fonts/RobotoMono/RobotoMono-Regular.ttf';

import SUIIcons_CSS from 'fonts/SUIIcons/CSS/icon.min.css';

const Colors = {
  os: {
    background: '#FAFBFC',
  },
  black: '#383838',
  white: '#FFFFFF',
  gray: {
    udark: '#1E2021',
    dark: '#909090',
    medium: '#C6C6C6',
    light: '#EAECED',
    ulight: '#EAECED',
  },
  blue: {
    dark: '#012268',
    medium: '#0D3684',
    light: '#1C70BA',
    ulight: '#f4f8f9',
    gradient: 'linear-gradient(90.12deg, #2E70B4 1.42%, #103585 94.18%)',
    dimmer: 'rgba(1, 34, 104, 0.2)',
  },
  red: '#c72f38',
  green: '#4BB543',
};

const Spacings = {
  mbXS: 'margin-bottom: 4px',
  mb1: 'margin-bottom: 8px',
  mb2: 'margin-bottom: 16px',
  mb3: 'margin-bottom: 24px',
  mb4: 'margin-bottom: 32px',
  mr1: 'margin-right: 8px',
  ml1: 'margin-left: 8px',
  mt1: 'margin-top: 8px',
  mt2: 'margin-top: 16px',
  mt3: 'margin-top: 24px',
  mt4: 'margin-top: 32px',
  mh1: 'margin-right: 8px; margin-left: 8px',
  pb1: 'padding-bottom: 8px',
  ph1: 'padding-left: 8px; padding-right: 8px',
  ph2: 'padding-left: 16px; padding-right: 16px',
  ph3: 'padding-left: 24px; padding-right: 24px',
  ph4: 'padding-left: 32px; padding-right: 32px',
  pv1: 'padding-top: 8px; padding-bottom: 8px',
  pv2: 'padding-top: 16px; padding-bottom: 16px',
  pv3: 'padding-top: 24px; padding-bottom: 24px',
  pv4: 'padding-top: 32px; padding-bottom: 32px',
};

export const Sys = {
  widths: {
    a: '1200px',
  },
  spacings: Spacings,
  shadow: 'box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.15)',
  borders: {
    radius: {
      small: '4px',
      medium: '6px',
      pill: '999px'
    },
    thin: 
    `
      border: 1px solid #EAECED
    `
  },
  colors: Colors,
  typography: {
    heading: 
    `
      font-family: 'PayPal_Sans_Big_Light';
      font-size: 22px;
      line-height: 140%;
    `,
    menuItem: 
    `
      font-family: 'PayPal_Sans_Small';
      font-size: 15px;
      color: ${Colors.black};
    `,
    buttons: {
      large: 
      `
        font-family: 'PayPal_Sans_Small_Medium';
        font-size: 18px;
      `,
      small: 
      `
        font-family: 'PayPal_Sans_Small';
        font-size: 13px;
      `
    },
    text: {
      heading: 
      `
        font-family: 'PayPal_Sans_Small_Medium';
        font-size: 14px;
      `,
      subheading: 
      `
        font-family: 'PayPal_Sans_Big_Light';
        font-size: 14px;
      `,
      paragraph: 
      `
        font-family: 'PayPal_Sans_Small';
        font-size: 14px;
      `,
      big:
      `
        font-family: 'PayPal_Sans_Small';
        font-size: 18px;
      `,
      small:
      `
        font-family: 'PayPal_Sans_Small';
        font-size: 11px;
      `,
    },
    data: 
    `
      font-family: 'RobotoMono';
      font-size: 11px;
    `
  },
  states: {
    error: `
      color: ${Colors.red};
    `,
    success: `
      color: ${Colors.green};
    `
  }
}

export const GlobalStyle = createGlobalStyle`
  ${SUIIcons_CSS}

  html,
  body {
    width: 100%;
    min-height: calc(100vh - 72px);
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  } 
  body {
    padding-top: 72px;
  }
  body, p, input {
    ${Sys.typography.text.paragraph}
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  .i-sc {
    width: 0.7em;
    height: 0.7em;
    margin-bottom: -0.1em;
  }
  .currency {
    ::after {
        content: "";
        display: inline-block;
        width: 1em;
        height: 1em;
        background: url("./assets/kaye-stable.svg") no-repeat bottom;
        
        background-size: 0.9em;
        transform: translateY(0.03em);
      }
    &.inverted::after {
      background: url("./assets/kaye-stable_inverted.svg") no-repeat bottom;
      background-size: contain;
    }

    &.big::after {
      background-size: 1em;
      transform: translateY(0);
    }
  }

  *.color- {
    color: ${Sys.colors.blue.light};
  }

  .page.modals {
    background-color: ${Sys.colors.blue.dimmer};
    position: absolute;
    top: 0 !important;
    left: 0 !important;
    width: 100%;
    height: 100%;
    text-align: center;
    vertical-align: middle;
    padding: 1em;
    opacity: 0;
    line-height: 1;
    flex-direction: column;
    align-items: center;
    user-select: none;
    z-index: 1000;

    &.visible {
      opacity: 1;
    }
  }
}`;
