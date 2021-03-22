import React, { useContext } from 'react';

import BN from 'bn.js';
import { AccountContext, BalanceVisibleContext } from '../utils/contexts';
import { Balance } from '@polkadot/types/interfaces';
import { useBalance } from '../hooks';
import { TableRow, TableCell } from '@material-ui/core';
import { Column } from '../utils/types';

import { AccountCard, BalanceValue, PopoverExtrinsic} from '.';

interface rowContent {
    withWhom: string,
    extrinsic: string,
    value: string|number,
    status: string | number
}
interface Props {
    row: rowContent,
    columns: Column[],
    showStatus?: boolean
}

const HistoryTableRow: React.FunctionComponent<Props> = ({columns, row, showStatus = true }) => {
    const { account } = useContext(AccountContext);
	const balanceArr = useBalance(account.userAddress);
	const { balanceVisibility } = useContext(BalanceVisibleContext);
	return (
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        <TableRow hover key={`transaction`}>
            {columns.map((column) => {
                const value: string | number = row[column.id];
                return (
                <TableCell key={`transaction-${column.id}`} align={column.align}>
                    {column.id === 'withWhom' &&
                        <AccountCard
                            account={{ address: value.toString(), name: '' }}
                        />
                    }
                    {column.id === 'extrinsic' && value}
                    {column.id === 'value' // This may look overwhelming but is just for "dump" data until page is fixed
                        && typeof value === 'number'
                        && <BalanceValue
                            isVisible={balanceVisibility}
                            value={new BN(value) as Balance}
                            unit={balanceArr[3]} />}
                    {showStatus && column.id === 'status' && <PopoverExtrinsic status={row.status} />}
                </TableCell>
                )
            })}
        </TableRow>
    );
}

export default HistoryTableRow;
