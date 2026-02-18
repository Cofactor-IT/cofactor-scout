import * as React from "react"
import { cn } from "@/lib/utils/formatting"

export interface Column<T> {
    key: string
    header: string
    width?: string
    render?: (item: T) => React.ReactNode
}

export interface TableProps<T> {
    columns: Column<T>[]
    data: T[]
    onRowClick?: (item: T) => void
    className?: string
}

export function Table<T extends { id?: string | number }>({ columns, data, onRowClick, className }: TableProps<T>) {
    return (
        <div className={cn(
            "w-full max-w-[1200px] bg-white border border-light-gray rounded-sharp shadow-sm overflow-hidden",
            className
        )}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="h-[52px] bg-off-white border-b border-light-gray">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-6 text-left font-heading font-medium text-[12px] text-cool-gray uppercase tracking-wider"
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr
                            key={item.id || idx}
                            className={cn(
                                "h-[72px] border-b border-light-gray last:border-b-0 transition-colors",
                                onRowClick ? "cursor-pointer hover:bg-[#F9FAFB]" : "bg-white"
                            )}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-6 font-body font-normal text-[14px] text-navy align-middle">
                                    {col.render ? col.render(item) : (item as any)[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="h-[72px] px-6 text-center font-body text-cool-gray">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
