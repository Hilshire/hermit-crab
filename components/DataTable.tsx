import React, { ReactNode } from 'react';
import {
  TableContainer, Table, TableCell, TableRow, TableBody, TableHead,
} from '@material-ui/core';

interface Props<T extends { id: number | string }> {
  heads: string[];
  columns: (keyof T)[];
  data: T[];
  operator: (row: T) => ReactNode;
  formatter: Partial<Record<keyof T, (row: T) => ReactNode>>;
}

function DataTable<T extends { id: number | string }>({
  heads, columns, data, operator, formatter,
}: Props<T>) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {heads.map((head) => <TableCell key={head}>{head}</TableCell>)}
            <TableCell>operator</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {
                columns.map((c) => (
                  <TableCell key={c as string}>
                    {formatter[c]?.(row) || String(row[c])}
                  </TableCell>
                ))
              }
              {operator(row)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export { DataTable };
export default DataTable;
