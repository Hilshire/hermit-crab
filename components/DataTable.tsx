import React, { PropsWithChildren, ReactNode } from "react"
import { TableContainer, Table, TableCell, TableRow, TableBody, TableHead  } from '@material-ui/core';

interface Props<T extends {id: number | string}> {
    heads: string[],
    columns?: (keyof T)[],
    data: T[],
    operator?: (any) => ReactNode,
}

function DataTable<T extends {id: number | string}>({ heads, columns, data, operator}: PropsWithChildren<Props<T>>) {
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
                        { operator && <TableCell>operator</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {_data.map(i => <TableRow key={i.id}>
                        {columns.map(c => <TableCell key={c as string}>{i[c]}</TableCell>)}
                        {operator && operator(i)}
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export {DataTable};