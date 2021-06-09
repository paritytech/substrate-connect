import React, { useContext } from 'react';

import BN from 'bn.js';
import { BalanceVisibleContext } from '../utils/contexts';
import { Balance } from '@polkadot/types/interfaces';
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
    unit?: string,
    showStatus?: boolean
}

const HistoryTableRow: React.FunctionComponent<Props> = ({columns, row, unit = 'Unit', showStatus = true }) => {
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
                        && (typeof value === 'number' || typeof value === 'string')
                        && <BalanceValue
                            isVisible={balanceVisibility}
                            value={new BN(value) as Balance}
                            unit={unit} />}
                    {showStatus && column.id === 'status' && <PopoverExtrinsic status={row.status} />}
                </TableCell>
                )
            })}
        </TableRow>
    );
}

export default HistoryTableRow;
