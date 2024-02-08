import React, { PropsWithChildren, ReactNode } from 'react';
import {
  TableContainer, Table, TableCell, TableRow, TableBody, TableHead,
} from '@material-ui/core';

interface Props<T extends { id: number | string }> {
  heads: string[],
  columns?: (keyof T)[],
  data: T[],
  operator?: (c: Partial<T>) => ReactNode,
  formatter?: Partial<Record<keyof T, (T) => T[keyof T]>>
}

function DataTable<T extends { id: number | string }>({
  heads, columns, data, operator, formatter
}: PropsWithChildren<Props<T>>) {
  const formattedData = data.map((i) => {
    const r: Partial<T> = {};
    columns.forEach((c) => {
      if (Object.prototype.hasOwnProperty.call(i, c)) {
        r[c] = formatter?.[c]?.(i) || i[c];
      }
    });
    return r;
  });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {heads.map((head) => <TableCell key={head}>{head}</TableCell>)}
            {operator && <TableCell>operator</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedData.map((i) => (
            <TableRow key={i.id}>
              {
                columns.map((c) => (
                  <TableCell key={c as string}>
                    {i[c] as unknown as string}
                  </TableCell>
                ))
              }
              {operator && operator(i)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

DataTable.defaultProps = {
  columns: [],
  operator: [],
};

export { DataTable };
export default DataTable;
