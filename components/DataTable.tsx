import React, { PropsWithChildren } from "react"
import { TableContainer, Table, TableCell, TableRow, TableBody, TableHead  } from '@material-ui/core';

interface Props<T extends {id: number | string}> {
    heads: string[],
    columns?: (keyof T)[],
    data: T[],
}

function DataTable<T extends {id: number | string}>({ heads, columns, data}: PropsWithChildren<Props<T>>) {
    const _data = data.map(i => {
        const r: Partial<T> = {};
        columns.forEach(c => {
            if (i.hasOwnProperty(c)) {
                r[c] = i[c];
            }
        })
        return r;
    })
    
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        { heads.map(head => <TableCell key={head}>{head}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {_data.map(i => <TableRow key={i.id}>
                        {columns.map(c => <TableCell key={c as string}>{i[c]}</TableCell>)}
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export {DataTable};