import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DataTableAlign = "left" | "center" | "right"

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  accessor: keyof T | ((row: T) => ReactNode)
  align?: DataTableAlign
  className?: string
  headerClassName?: string
  cellClassName?: string
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  caption?: string
  emptyMessage?: string
  getRowKey?: (row: T, index: number) => string
  className?: string
}

const alignClasses: Record<DataTableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

function renderCellValue<T>(row: T, column: DataTableColumn<T>) {
  if (typeof column.accessor === "function") {
    return column.accessor(row)
  }

  const value = row[column.accessor]
  if (value === null || value === undefined || typeof value === "boolean") {
    return value ? "Yes" : value === false ? "No" : "-"
  }

  return value as ReactNode
}

export function DataTable<T>({
  columns,
  data,
  caption,
  emptyMessage = "No rows to display.",
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/70",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          {caption ? (
            <caption className="px-5 py-3 text-left text-xs font-medium text-slate-400">
              {caption}
            </caption>
          ) : null}
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-5 py-3 font-mono text-[0.72rem] font-semibold text-slate-400",
                    alignClasses[column.align ?? "left"],
                    column.headerClassName,
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey?.(row, rowIndex) ?? rowIndex}
                  className="border-b border-slate-800/80 last:border-b-0 hover:bg-sky-500/[0.04]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-5 py-4 text-slate-200",
                        alignClasses[column.align ?? "left"],
                        column.cellClassName,
                        column.className
                      )}
                    >
                      {renderCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
