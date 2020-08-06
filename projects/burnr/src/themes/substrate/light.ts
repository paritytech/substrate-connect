import { ThemeOptions } from '@material-ui/core/styles';
import colors from './colors';
import typography from './typography';
import shadows from './shadows';

const light: ThemeOptions = {
	typography: typography.typography,
	shadows: shadows.shadows,
	palette: {
		type: 'light',

		common: {
			black: colors.black,
			white: colors.white,
		},
		background: {
			paper: colors.light.light,
			default: colors.white.dark,
		},
		primary: {
			light: colors.cyan.light,
			main: colors.cyan.main,
			dark: colors.cyan.dark,
			contrastText: colors.black,
		},
		secondary: {
			light: colors.pink.light,
			main: colors.pink.main,
			dark: colors.pink.dark,
			contrastText: colors.white,
		},
		error: {
			light: 'rgba(247, 4, 7, 1)',
			main: 'rgba(235, 4, 7, 1)',
			dark: 'rgba(197, 5, 8, 1)',
			contrastText: colors.paper,
		},
		text: {
			primary: colors.black,
			secondary: colors.dark.main,
			disabled: colors.light.dark,
			hint: colors.yellow.main,
		},
		divider: 'rgba(0, 0, 0, 0)',
	},
};

export default light;
