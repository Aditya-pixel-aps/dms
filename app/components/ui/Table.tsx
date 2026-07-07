import React from "react";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowKey,
  onRowDoubleClick,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  onRowDoubleClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
      <table className="w-full text-left text-sm text-card-foreground">
        <thead className="border-b border-border bg-secondary-hover/50 text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              className={`transition-colors ${
                onRowDoubleClick ? "cursor-pointer hover:bg-secondary-hover/40" : ""
              }`}
              onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5">
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
