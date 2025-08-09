'use client'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel } from '@tanstack/react-table'
import { useMemo, useState } from 'react';
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'





type columns = {
    accessorKey: string;
    header: string;
}



const Table = ({ columns, data }: { columns: columns[], data: any[] }) => {
   
    const safeData = Array.isArray(data) ? data : [];
    const [sorting, setSorting] = useState<SortingState>([])
    const [filter, setFilter] = useState("")
    const router = useRouter()


    const columnsTable = useMemo(() => columns.map(col => ({
        header: col.header,
        accessorKey: col.accessorKey,
        cell: (info) => {
            if (col.accessorKey === "date") return dayjs(info.getValue()).format("DD/MM/YYYY")
            if (col.accessorKey === "monthYear") return info.row.original.month + '-' + info.row.original.year
            if (col.accessorKey === "detail") return <button className='cursor-pointer hover:underline' onClick={() => router.push(`movements/${info.row.original.year}-${info.row.original.month}`)}>Ver detalles </button>;

            return info.getValue()
        }
    })), [columns,router])


    const table = useReactTable({
        data: safeData,
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
        <div className='p-10'>
            <input className='border border-gray-300' type="text" value={filter} onChange={e => setFilter(String(e.target.value))} placeholder='Buscar...' />
            <table className='border border-gray-300 w-auto min-w-2xl'>
                <thead className='bg-black text-white w-full'>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className='w-full'>
                            {headerGroup.headers.map(header => (
                                <th className='text-start'
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}>
                                    {header.isPlaceholder ? null : (
                                        <div>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {
                                                {
                                                    asc: ' ↑',
                                                    desc: ' ↓'
                                                }[header.column.getIsSorted() as string] ?? null
                                            }
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {
                        table && table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {
                                    row.getVisibleCells().map(cell => (
                                        <td key={cell.id} >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className='flex gap-5 p-2'>
                <button className='border border-gray-200 p-1 cursor-pointer' onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                    Primer pagina
                </button>
                <button className='border border-gray-200 p-1 cursor-pointer' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    {'<'}
                </button>
                <button className='border border-gray-200 p-1 cursor-pointer' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    {'>'}
                </button>
                <button className='border border-gray-200 p-1 cursor-pointer' onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                    Ultima pagina
                </button>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Mostrar {pageSize} filas
                        </option>
                    ))}
                </select>
                <span className="flex items-center gap-1">
                    | Ir a la pagina:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
            </div>
        </div>
    )
}

export default Table