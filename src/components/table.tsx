'use client'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, SkipBack, SkipForward, Eye, FileText } from 'lucide-react';
import { ColumnsProps, DataProps, Info } from '@/interfaces/index'

type TableProps = {
    columns: ColumnsProps[]
    data: DataProps[]
    total?: number
}

type Row = {
    year: number;
    month: number;
}

const Table = ({ columns, data, total }: TableProps) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [filter, setFilter] = useState("")

    const router = useRouter()

    const columnsTable = useMemo(() => columns.map(col => ({
        header: col.header,
        accessorKey: col.accessorKey,
        accessorFn: col.accessorKey === "monthYear" ? (row: Row) => new Date(row.year, row.month - 1, 1) : undefined,
        cell: (info: Info) => {
            if (col.accessorKey === "date") return dayjs(info.getValue()).format("DD/MM/YYYY")
            if (col.accessorKey === "monthYear") return info.row.original.month + '-' + info.row.original.year
            if (col.accessorKey === "detail") return (
                <button 
                    className='inline-flex items-center space-x-2 text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors duration-200 font-medium' 
                    onClick={() => router.push(`movements/${info.row.original.year}-${info.row.original.month}`)}
                >
                    <Eye size={16} />
                    <span>Ver detalles</span>
                </button>
            );
            if (col.accessorKey === "pdfUrl") return (
                <Link 
                    target="_blank" 
                    className='inline-flex items-center space-x-2 text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors duration-200 font-medium' 
                    href={info.row.original.pdfUrl ? info.row.original.pdfUrl : "/"}
                >
                    <FileText size={16} />
                    <span>Ver PDF</span>
                </Link>
            )

            return info.getValue()
        }
    })), [columns, router])

    useEffect(() => {
       const result = columns.find(element => element.accessorKey === 'monthYear')
       if(result) setSorting([{id: 'monthYear', desc: false}])
    },[columns])

    const table = useReactTable({
        data,
        columns: columnsTable,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            globalFilter: filter
        },
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setFilter
    })

    return (
        <div className='w-full max-w-6xl mx-auto p-6 animate-fade-in'>
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-muted)]" />
                    <input 
                        type="text" 
                        value={filter} 
                        onChange={e => setFilter(String(e.target.value))} 
                        placeholder='Buscar...' 
                        className="
                            w-full pl-10 pr-4 py-3 
                            bg-[var(--input-bg)] 
                            border border-[var(--border)] 
                            rounded-xl
                            text-[var(--foreground)]
                            placeholder:text-[var(--foreground-muted)]
                            focus:border-[var(--primary)]
                            focus:ring-0
                            transition-all duration-200
                        "
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className='w-full'>
                        <thead className='bg-[var(--background-tertiary)]'>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th 
                                            key={header.id}
                                            className="
                                                px-6 py-4 text-left font-semibold text-[var(--foreground)]
                                                cursor-pointer hover:bg-[var(--border)] transition-colors duration-200
                                                select-none
                                            "
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div className="flex items-center space-x-2">
                                                    <span>
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        {header.column.getIsSorted() === 'asc' && (
                                                            <ChevronUp size={16} className="text-[var(--primary)]" />
                                                        )}
                                                        {header.column.getIsSorted() === 'desc' && (
                                                            <ChevronDown size={16} className="text-[var(--primary)]" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row, index) => (
                                <tr 
                                    key={row.id}
                                    className={`
                                        border-b border-[var(--border)]
                                        hover:bg-[var(--background-tertiary)]
                                        transition-colors duration-200
                                        ${index % 2 === 0 ? 'bg-[var(--background-secondary)]' : 'bg-[var(--card-bg)]'}
                                    `}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className='px-6 py-4 text-[var(--foreground-secondary)]'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {typeof total === 'number' && (
                            <tfoot className="bg-[var(--background-tertiary)] border-t-2 border-[var(--border)]">
                                <tr>
                                    <td 
                                        className='px-6 py-4 text-right font-semibold text-[var(--foreground)]' 
                                        colSpan={table.getAllColumns().length - 1}
                                    >
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-lg text-[var(--primary)]">
                                        ${total.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                <div className='flex items-center justify-between p-4 bg-[var(--background-tertiary)] border-t border-[var(--border)]'>
                    <div className='flex items-center space-x-2'>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => table.setPageIndex(0)} 
                            disabled={!table.getCanPreviousPage()}
                        >
                            <SkipBack size={16} />
                        </button>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => table.previousPage()} 
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => table.nextPage()} 
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
                            disabled={!table.getCanNextPage()}
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="
                                px-3 py-2 rounded-lg border border-[var(--border)] 
                                bg-[var(--input-bg)] text-[var(--foreground)]
                                focus:border-[var(--primary)]
                                transition-colors duration-200
                            "
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize} filas
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-[var(--foreground-secondary)]">Página:</span>
                            <input
                                type="number"
                                defaultValue={table.getState().pagination.pageIndex + 1}
                                onChange={e => {
                                    const page = e.target.value ? Number(e.target.value) - 1 : 0
                                    table.setPageIndex(page)
                                }}
                                className="
                                    w-16 px-2 py-1 rounded border border-[var(--border)] 
                                    bg-[var(--input-bg)] text-center
                                    focus:border-[var(--primary)]
                                    transition-colors duration-200
                                "
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Table