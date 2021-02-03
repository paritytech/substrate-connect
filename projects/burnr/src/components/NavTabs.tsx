import React from 'react';

import { Tabs, Tab, Typography, Box, Paper, Divider, makeStyles, Theme } from '@material-ui/core';
import SwapHorizSharpIcon from '@material-ui/icons/SwapHorizSharp';
import CallMadeSharpIcon from '@material-ui/icons/CallMadeSharp';
import CallReceivedSharpIcon from '@material-ui/icons/CallReceivedSharp';
import WhatshotSharpIcon from '@material-ui/icons/WhatshotSharp';

import { LocalStorageUserAccount } from '../utils/types';

import { HistoryTable, AccountMenu } from './index';
import SendFundsForm from './SendFundsForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Props {
	setUser: (arg0: LocalStorageUserAccount) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		height:'calc(100vh - 265px)',
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,

		[theme.breakpoints.down('sm')]: {
			height:'calc(100vh - 320px)',
		},
	},
}));

const TabPanel: React.FunctionComponent<TabPanelProps> = ({ children, value, index, ...props }: TabPanelProps) => {
	return (
		<div
			hidden={value !== index}
			id={`tabpanel-${index}`}
			{...props}
		>
			{value === index && (
				<Box p={2}>
					{children}
				</Box>
			)}
		</div>
	);
};

const NavTabs: React.FunctionComponent<Props> = ({ setUser }: Props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setValue(newValue);
	};

	return (
		<>
			<Paper square>
				<Tabs
					value={value}
					onChange={handleChange}
					variant='fullWidth'
				>
					<Tab label="Account" icon={<WhatshotSharpIcon/>} style={{ minHeight: 64, paddingTop: 0 }} />
					<Tab label="History" icon={<SwapHorizSharpIcon/>} style={{ minHeight: 64, paddingTop: 0 }}  />
					<Tab label="Send" icon={<CallMadeSharpIcon/>} style={{ minHeight: 64, paddingTop: 0 }}  />
					<Tab label="Receive" icon={<CallReceivedSharpIcon/>} style={{ minHeight: 64, paddingTop: 0 }}  />
				</Tabs>
			</Paper>

			<Divider />

			<Paper className={classes.root}>
				<TabPanel value={value} index={0}>
					<Typography variant='h2'>
						Account Controls
					</Typography>
					<AccountMenu setUser={setUser} />
				</TabPanel>
				<TabPanel value={value} index={1}>
					<Typography variant='h2'>
						Transaction History
					</Typography>
					<HistoryTable />
				</TabPanel>
				<TabPanel value={value} index={2}>
					<Typography variant='h2'>
						Send Funds
					</Typography>
					<SendFundsForm />
				</TabPanel>
				<TabPanel value={value} index={3}>
					<Typography variant='h2'>
						Receive Funds
					</Typography>
					{/*  TO-DO:
						Need to create the <ReceiveFundsFrom />
						Needs some more brainstorming/research on what will be put here
					*/}
				</TabPanel>
			</Paper>
		</>
	);
};

export default NavTabs;
