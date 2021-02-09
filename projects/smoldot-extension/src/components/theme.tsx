import { ThemeOptions } from '@material-ui/core/styles';

const light: ThemeOptions = {
	typography: {
		fontFamily: '\Inter\, \-apple-system\, \BlinkMacSystemFont\, \Segoe UI\, \Helvetica\, \Arial\, \Segoe UI\, \Arial\, sans-serif, \"Apple Color Emoji"\, \"Segoe UI Emoji"',
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
			fontSize: 18,
			lineHeight: '120%',
		},
		h4: {
			fontWeight: 500,
			fontSize: 15,
			lineHeight: '120%',
		},
		body1: {
			fontWeight: 400,
			fontSize: 14,
			lineHeight: '135%',
			letterSpacing: 0.15,
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
			fontFamily: '\SFMono-Regular\, \Consolas\ , \Liberation Mono\, \Menlo\, monospace',
			fontWeight: 400,
			fontSize: 20,
			lineHeight: '120%',
		},
		subtitle2: {
			fontFamily: '\SFMono-Regular\, \Consolas\ , \Liberation Mono\, \Menlo\, monospace',
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
};

export default light;
