import React, { useContext } from 'react';

import BN from 'bn.js';
import { AccountContext, BalanceVisibleContext } from '../utils/contexts';
import { Balance } from '@polkadot/types/interfaces';
import { useBalance } from '../hooks';

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

import { AccountCard, BalanceValue, PopoverExtrinsic} from './index';
import { ExtrinsicInfo } from '../utils/types';

interface Column {
  id: 'withWhom' | 'extrinsic' | 'value' | 'status';
  label: string;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  align?: 'right';
}

const columns: Column[] = [
	{ id: 'withWhom', label: '', width: 160 },
	{ id: 'extrinsic', label: 'Extrinsic' },
	{ id: 'value', label: 'Value', minWidth: 170, align: 'right' },
	{ id: 'status', label: 'Status', width: 40, align: 'right' }
];

interface Data extends ExtrinsicInfo {
	withWhom: string;
	value: string|number;
	extrinsic: string;
}

function createData(withWhom: string, extrinsic: string, value: string|number, status: string|0|2|1): Data {
	return { withWhom, extrinsic, value, status };
}

// @TODO real data?

const rows: Data[] = [
	createData('F7BeW4g5ViG8xGJQAzguGPxiX9QNdoPNc3YqF1bV8d9XkVV', 'balances.transfer', 132417.1354, 0),
	createData('Gt6HqWBhdu4Sy1u8ASTbS1qf2Ac5gwdegwr8tWN8saMxPt5', 'balances.transfer', 140350.0365, 1),
	createData('Czugcaso8uTUyA5ptvpZp1jthoWSESrR6aFPCh7DnswH7TQ', 'balances.transfer', 6048.3973, 2),
	createData('Eodfj4xjkw8ZFLLSS5RfP6vCMw8aM6qfM7BfeQMf6ivFWHy', 'balances.transfer', 32716.7434, 0),
	// createData('GxxV8DAcHCSzBbspu83AK9UoTYxzSQ6VVfdopjnkXfPtE8d', 'claims.attest', '[...]', 1),
	createData('F7Wa1su7NRSr6LWuhPWdXcQALDyzm8Vmev7WtV5jVPtJELs', 'democracy.vote', 2547.5400, 1),
	createData('FApDgUYw47GJMfwFaa7xPeR5FGtMkPWSoozW7n5tTPWwrNv', 'democracy.vote', 8301.9200, 1),
	createData('GLVeryFRbg5hEKvQZcAnLvXZEXhiYaBjzSDwrXBXrfPF7wj', 'balances.transfer', 485.7000, 1),
	createData('DksmawBXTCnFQhVzsVqFhLDRA67S8SJNLADT9aJ36Lrb7kT', 'balances.transfer', 12631.7000, 1),
	createData('H9eSvWe34vQDJAWckeTHWSqSChRat8bgKHG39GC1fjvEm7y', 'balances.transfer', 6754.5757, 1),
	createData('EK8veMNH6sVtvhSRo4q1ZRh6huCDm69gxK4eN5MFoZzo3G7', 'balances.transfer', 12657.7691, 1),
	createData('EK8veMNH6sVtvhSRo4q1ZRh6huCDm69gxK4eN5MFoZzo3G7', 'balances.transfer', 12657.7691, 0),
	createData('J9nD3s7zssCX7bion1xctAF6xcVexcpy2uwy4jTm9JL8yuK', 'balances.transfer', 14679.3744, 1),
	// createData('GxxV8DAcHCSzBbspu83AK9UoTYxzSQ6VVfdopjnkXfPtE8d', 'claims.attest', '[...]', 1),
	createData('J9nD3s7zssCX7bion1xctAF6xcVexcpy2uwy4jTm9JL8yuK', 'balances.transfer', 21014.7125, 1)
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
	const balanceArr = useBalance(account.userAddress);
	const { balanceVisibility } = useContext(BalanceVisibleContext);

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
								<TableRow hover key={`transaction-${i}`}>

									{columns.map((column) => {
										const value = row[column.id];

										return (
											<TableCell key={`transaction-${i}${column.id}`} align={column.align}>
												{column.id === 'withWhom' &&
													<AccountCard
														account={{ address: value.toString(), name: '' }}
													/>
												}
												{column.id === 'extrinsic' && value}
												{ // This may look overwhelming but is just for "dump" data until page is fixed
												column.id === 'value'
													&& typeof value === 'number'
													&& <BalanceValue
														isVisible={balanceVisibility}
														value={new BN(value) as Balance}
														unit={balanceArr[3]} />}
												{column.id === 'status' && <PopoverExtrinsic status={value} />}

											</TableCell>
										);
									})}

								</TableRow>
							);
						})}

					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}

export default HistoryTable;
