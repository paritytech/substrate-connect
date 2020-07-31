import React from 'react';

import { Tabs, Tab, Typography, Box, Paper, Divider } from '@material-ui/core';
import SwapHorizSharpIcon from '@material-ui/icons/SwapHorizSharp';
import CallMadeSharpIcon from '@material-ui/icons/CallMadeSharp';
import WhatshotSharpIcon from '@material-ui/icons/WhatshotSharp';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FunctionComponent<TabPanelProps> = ({ children, value, index, ...rest }: TabPanelProps) => {
	return (
		<div
			hidden={value !== index}
			id={`tabpanel-${index}`}
			{...rest}
		>
			{value === index && (
				<Box p={2}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
};

const NavTabs: React.FunctionComponent = () => {
	const [value, setValue] = React.useState(0);
	const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setValue(newValue);
	};

	return (
		<>
			<Paper>
				<Tabs
					value={value}
					onChange={handleChange}
					variant='fullWidth'
				>
					<Tab label="Account" icon={<WhatshotSharpIcon/>}/>
					<Tab label="History" icon={<SwapHorizSharpIcon/>} />
					<Tab label="Send" icon={<CallMadeSharpIcon/>} />
				</Tabs>
			</Paper>

			<Divider />

			<Paper>
				<TabPanel value={value} index={0}>
					<Typography variant='h2'>
          Account Controls
					</Typography>
					<Typography variant='body2'>
						Lorem Ipsum
					</Typography>
				</TabPanel>
				<TabPanel value={value} index={1}>
					<Typography variant='h2'>
						Transaction History
					</Typography>
					<Typography variant='body2'>
						Lorem Ipsum
					</Typography>
				</TabPanel>
				<TabPanel value={value} index={2}>
					<Typography variant='h2'>
          Send Funds
					</Typography>
					<Typography variant='body2'>
						Lorem Ipsum
					</Typography>
				</TabPanel>
			</Paper>
		</>
	);
};

export default NavTabs;
