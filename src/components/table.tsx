'use client'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel } from '@tanstack/react-table'
import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, SkipBack, SkipForward, Eye, FileText } from 'lucide-react';
import { ColumnsProps, DataProps, Info } from '@/interfaces/index';

// --- Type Definitions and Interfaces (Ensuring consistency) ---

/** 
 * Represents the data structure of a single row in the table.
 * This must extend DataProps to ensure all original fields are available.
 */
type TableRowData = DataProps & {
    year: number | string;
    month: number | string;
};

// --- Component Implementation ---

const Table = ({ columns, data, total }: { 
    columns: ColumnsProps[]; 
    data: DataProps[]; 
    total?: number 
}) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [filter, setFilter] = useState("");

    const router = useRouter();

// Process column definitions to ensure type safety and compatibility with react-table.
const columnsTable = useMemo(() => {
    return columns.map(col => ({
        header: col.header,
        accessorKey: col.accessorKey as keyof DataProps | string,
        // The accessorFn needs type safety focusing on the expected data structure (DataProps).
        accessorFn: (row: DataProps) => { 
            if (!col.accessorKey) return undefined;

            // Specific logic for monthYear calculation from separate fields
            if (col.accessorKey === "monthYear") {
                const year = row['year'] as number | string;
                const month = row['month'] as number | string;
                return typeof year === 'number' && typeof month === 'number' ? new Date(Number(year), Number(month) - 1, 1) : null;
            }

            // Determine the key safely and access the property. Use explicit checks to avoid `any`.
            const key = col.accessorKey as keyof DataProps | string;
            if (typeof row[key] !== 'undefined' && key !== "monthYear") {
                return row[key];
            }

            // Fallback attempt for specific keys if direct access fails
            const knownKeys: Array<keyof DataProps> = ['date', 'createdDate'];
            if (knownKeys.includes(col.accessorKey as keyof DataProps)) {
                return (row as any)[col.accessorKey]; // Fallback to dynamic casting only when necessary
            }

            return undefined;
        },
        cell: (info: Info) => {
            if (col.cell) return col.cell(info);

            const rowData = info.row.original as DataProps;

            // Date formatting helper utility to minimize 'any' and improve safety
            const formatDate = (raw: string | number | Date | null | undefined): string => {
                if (!raw || raw === '') return '—';
                try {
                    const parsed = dayjs(String(raw)); 
                    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : '—';
                } catch (e) {
                    console.error('Date formatting error:', e);
                    return '—';
                }
            };

            // Specific rendering logic based on column key
            if (col.accessorKey === "date" || col.accessorKey === "createdDate") {
                return formatDate(info.getValue());
            }
            if (col.accessorKey === "monthYear") return `${rowData['month']}-${rowData['year']}`; 
            
            // Detail button logic (Requires year and month fields)
            if (col.accessorKey === "detail") {
                const year = rowData['year'];
                const month = rowData['month'];
                return (
                    <button 
                        className='inline-flex items-center space-x-2 text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors duration-200 font-medium' 
                        onClick={() => {
                            if (year && month) router.push(`/movements/${String(year)}-${String(month)}`);
                        }}
                    >
                        <Eye size={16} />
                        <span>Ver detalles</span>
                    </button>
                );
            }

            // PDF Link logic
            if (col.accessorKey === "pdfUrl") {
                const url = rowData.pdfUrl as string;
                return (
                    <Link 
                        target="_blank" 
                        className='inline-flex items-center space-x-2 text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors duration-200 font-medium' 
                        href={url || "/"}
                    >
                        <FileText size={16} />
                        <span>Ver PDF</span>
                    </Link>
                );
            }

            // Fallback for display: return the value cast as ReactNode if possible.
            return info.getValue() as React.ReactNode;
        }
    })) as any[] 
    }, [columns, router]);

    // Effect hook to set default sorting when columns are available
    useEffect(() => {
       const result = columns.find(element => element.accessorKey === 'monthYear');
       if (result) setSorting([{id: 'monthYear', desc: false}]);
    }, [columns]);


    const tableInstance = useReactTable({
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
    });

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
                        className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:ring-0 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className='w-full'>
                        <thead className='bg-[var(--background-tertiary)]'>
                            {tableInstance.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th 
                                            key={header.id}
                                            className="px-6 py-4 font-semibold text-[var(--foreground)] cursor-pointer hover:bg-[var(--border)] transition-colors duration-200 select-none"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        {header.column.getIsSorted() === 'asc' && (<ChevronUp size={16} className="text-[var(--primary)]" />)}
                                                        {header.column.getIsSorted() === 'desc' && (<ChevronDown size={16} className="text-[var(--primary)]" />)}
                                                    </div>
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr >
                            ))}
                        </thead >
                        <tbody>
                            {tableInstance.getRowModel().rows.map((row, index) => (
                                <tr 
                                    key={row.id}
                                    className={`text-center border-b border-[var(--border)] hover:bg-[var(--background-tertiary)] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[var(--background-secondary)]' : 'bg-[var(--card-bg)]'} `}
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
                                <tr className='text-right'>
                                    <td 
                                        className='px-6 py-4 font-semibold text-[var(--foreground)]' 
                                        colSpan={tableInstance.getAllColumns().length - 1}
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
                <div className='flex items-center justify-between flex-wrap p-4 bg-[var(--background-tertiary)] border-t border-[var(--border)]'>
                    <div className='flex items-center space-x-2'>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => tableInstance.setPageIndex(0)} 
                            disabled={!tableInstance.getCanPreviousPage()}
                        >
                            <SkipBack size={16} />
                        </button>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => tableInstance.previousPage()} 
                            disabled={!tableInstance.getCanPreviousPage()}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => tableInstance.nextPage()} 
                            disabled={!tableInstance.getCanNextPage()}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button 
                            className='p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                            onClick={() => tableInstance.setPageIndex(tableInstance.getPageCount() - 1)} 
                            disabled={!tableInstance.getCanNextPage()}
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <select
                            value={tableInstance.getState().pagination.pageSize}
                            onChange={e => tableInstance.setPageSize(Number(e.target.value))}
                            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] focus:border-[var(--primary)] transition-colors duration-200"
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>{pageSize} filas</option>
                            ))}
                        </select>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-[var(--foreground-secondary)]">Página:</span> 
                            <input
                                type="number"
                                defaultValue={tableInstance.getState().pagination.pageIndex + 1}
                                onChange={e => {
                                    let page: number;
                                    const value = e.target.value;
                                    if (value) {
                                        page = Math.max(0, parseInt(value) - 1);
                                    } else {
                                        page = 0;
                                    }
                                    tableInstance.setPageIndex(Math.min(Math.max(0, page), tableInstance.getPageCount() - 1));
                                }}
                                className="w-16 px-2 py-1 rounded border border-[var(--border)] bg-[var(--input-bg)] text-center focus:border-[var(--primary)] transition-colors duration-200"
                            />
                        </div>
                    </div>
                </div>
            </div >
        </div>
    );
}

// Since the module uses named exports from 'next/navigation' and is structured as a default export in context, 
// we ensure it's properly exported to resolve the import error in page.tsx.
export default Table;