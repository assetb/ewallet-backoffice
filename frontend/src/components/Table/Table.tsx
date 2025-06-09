import React from "react";
import styles from "./Table.module.css";

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
}

function Table<T>({ columns, data, getRowKey }: Readonly<TableProps<T>>) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header} className={styles.th}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td className={styles.td} colSpan={columns.length}>
              Нет данных
            </td>
          </tr>
        )}
        {data.map((row) => (
          <tr key={getRowKey(row)} className={styles.tr}>
            {columns.map((col) => (
              <td key={String(col.accessor)} className={styles.td}>
                {col.render
                  ? col.render(row[col.accessor], row)
                  : (row[col.accessor] as any)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
