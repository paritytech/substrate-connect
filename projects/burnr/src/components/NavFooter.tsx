import React from 'react';

import { Typography, Box, Link } from '@material-ui/core';

const AppFooter: React.FunctionComponent = () => (
	<Typography variant='body2'>
		<Box component={'span'} m={1}>
			<Link href='#' color='textPrimary'>
        © 2020 Parity Technologies
			</Link>
		</Box>
		<Box component={'span'} m={1}>
			<Link href='#' color='textPrimary'>
        Terms & conditions
			</Link>
		</Box>
		<Box component={'span'} m={1}>
			<Link href='#' color='textPrimary'>
        Privacy policy
			</Link>
		</Box>
		<Box component={'span'} m={1}>
			<Link href='#' color='textPrimary'>
        Report an issue
			</Link>
		</Box>
	</Typography>
);

export default AppFooter;