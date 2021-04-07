import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Theme,
	createStyles
} from '@material-ui/core';

import { AccountContext } from '../utils/contexts';
import { HistoryTableRow } from '.';
import { Data, Column } from '../utils/types';

const columns: Column[] = [
	{ id: 'withWhom', label: '', width: 160},
	{ id: 'extrinsic', label: 'Extrinsic'},
	{ id: 'value', label: 'Value', minWidth: 170, align: 'right' },
	{ id: 'status', label: 'Status', width: 40, align: 'right' }
];

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		container: {
			marginTop: theme.spacing(1),
			width: `calc(100% + ${theme.spacing(4)} px)`,
			marginLeft: theme.spacing(-2),
			maxHeight: 'calc(100vh - 320px)',

			[theme.breakpoints.down('sm')]: {
				height:'calc(100vh - 380px)',
			},
			'& th': {
				backgroundColor: theme.palette.background.paper,
				color: theme.palette.text.disabled,
			},
			'& td, & th': {
				padding: theme.spacing(0.5),
			},
			'& td:first-child': {
				paddingLeft: theme.spacing(2),
			},
			'& td:last-child, & th:last-child': {
				textAlign: 'center',
			},
			'& tr:hover': {
				backgroundColor: 'transparent !important',
				'& button': {
					backgroundColor: 'rgba(0, 0, 0, 0.03)',
				},
			},
		},
	})
);

const HistoryTable: React.FunctionComponent = () => {
	const classes = useStyles();
	const { account } = useContext(AccountContext);
	const rows:Data[] = account.userHistory;

	return (
		<>
			<TableContainer className={classes.container}>
				<Table size="small" stickyHeader>
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell
									key={column.id}
									align={column.align}
									style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
								>
									{column.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, i) => {
							return (
								<HistoryTableRow
									key={i}
									row={row}
									columns={columns}
								/>
							);
						})}

					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}

export default HistoryTable;
