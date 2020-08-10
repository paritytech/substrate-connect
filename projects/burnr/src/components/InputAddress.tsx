import React from 'react';

import { FormControl, TextField, Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

import Identicon from '@polkadot/react-identicon';

const InputAddress: React.FunctionComponent = () => {
	const [value, setValue] = React.useState<string>('');
	const handleChangeButton = (e) => {
		setValue(e.currentTarget.value);
	};

	return (
		<>
			<Box marginY={1}>
				<FormControl required fullWidth >
					<TextField
						label="Address"
						onChange={handleChangeButton}
						value={value}
						variant="outlined"
						InputProps={{
							startAdornment:
                <Box marginRight={1}>
                	{ (!value || value == '')
                		? <Skeleton variant='circle' width={32} height={32} />
                		: <Identicon
                			size={32}
                			theme='polkadot'
                			value={value}
                		/>
                	}
                </Box>,
						}}
					/>
				</FormControl>
			</Box>
		</>
	);};

export default React.memo(InputAddress);