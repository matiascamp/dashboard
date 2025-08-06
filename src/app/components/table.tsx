'use client'
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, CellContext, getSortedRowModel, SortingState,getFilteredRowModel } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useState } from 'react';



type Test = {
    id: number,
    nombre: string;
    descripcion: string;
    monto: number;
    fecha: string;
}
const testData: Test[] = [
    { id: 1, nombre: "ferreteria", descripcion: "Compra de herramientas y materiales", monto: 1000, fecha: "2025-01-01" },
    { id: 2, nombre: "supermercado", descripcion: "Compra de productos alimenticios", monto: 850, fecha: "2025-01-02" },
    { id: 3, nombre: "farmacia", descripcion: "Compra de medicamentos y productos de salud", monto: 450, fecha: "2025-01-03" },
    { id: 4, nombre: "gasolinera", descripcion: "Combustible para el vehículo", monto: 2200, fecha: "2025-01-04" },
    { id: 5, nombre: "restaurante", descripcion: "Comida y bebidas", monto: 320, fecha: "2025-01-05" },
    { id: 6, nombre: "libreria", descripcion: "Compra de libros y material educativo", monto: 180, fecha: "2025-01-06" },
    { id: 7, nombre: "panaderia", descripcion: "Pan y productos de panadería", monto: 95, fecha: "2025-01-07" },
    { id: 8, nombre: "banco", descripcion: "Comisiones bancarias", monto: 25, fecha: "2025-01-08" },
    { id: 9, nombre: "tienda de ropa", descripcion: "Compra de ropa y accesorios", monto: 1800, fecha: "2025-01-09" },
    { id: 10, nombre: "electrodomesticos", descripcion: "Electrodomésticos para el hogar", monto: 15500, fecha: "2025-01-10" },
    { id: 11, nombre: "veterinaria", descripcion: "Consulta y tratamiento veterinario", monto: 680, fecha: "2025-01-11" },
    { id: 12, nombre: "peluqueria", descripcion: "Servicios de peluquería y estética", monto: 350, fecha: "2025-01-12" },
    { id: 13, nombre: "tintoreria", descripcion: "Servicio de limpieza en seco", monto: 120, fecha: "2025-01-13" },
    { id: 14, nombre: "optica", descripcion: "Examen visual y compra de lentes", monto: 2800, fecha: "2025-01-14" },
    { id: 15, nombre: "dentista", descripcion: "Consulta y tratamiento dental", monto: 4500, fecha: "2025-01-15" },
    { id: 16, nombre: "gimnasio", descripcion: "Membresía mensual del gimnasio", monto: 890, fecha: "2025-01-16" },
    { id: 17, nombre: "cine", descripcion: "Entradas de cine y snacks", monto: 240, fecha: "2025-01-17" },
    { id: 18, nombre: "parking", descripcion: "Estacionamiento por horas", monto: 45, fecha: "2025-01-18" },
    { id: 19, nombre: "taxi", descripcion: "Servicio de transporte", monto: 85, fecha: "2025-01-19" },
    { id: 20, nombre: "delivery", descripcion: "Entrega de comida a domicilio", monto: 420, fecha: "2025-01-20" },
    { id: 21, nombre: "internet", descripcion: "Servicio de internet mensual", monto: 990, fecha: "2025-01-21" },
    { id: 22, nombre: "telefonia", descripcion: "Plan telefónico mensual", monto: 750, fecha: "2025-01-22" },
    { id: 23, nombre: "electricidad", descripcion: "Factura de energía eléctrica", monto: 1350, fecha: "2025-01-23" },
    { id: 24, nombre: "agua", descripcion: "Factura de servicio de agua", monto: 680, fecha: "2025-01-24" },
    { id: 25, nombre: "gas", descripcion: "Factura de servicio de gas", monto: 920, fecha: "2025-01-25" },
    { id: 26, nombre: "seguros", descripcion: "Prima mensual de seguros", monto: 2400, fecha: "2025-01-26" },
    { id: 27, nombre: "hotel", descripcion: "Hospedaje por una noche", monto: 3800, fecha: "2025-01-27" },
    { id: 28, nombre: "alquiler auto", descripcion: "Alquiler de vehículo por día", monto: 1200, fecha: "2025-01-28" },
    { id: 29, nombre: "mecánico", descripcion: "Reparación y mantenimiento del auto", monto: 5600, fecha: "2025-01-29" },
    { id: 30, nombre: "curso online", descripcion: "Curso de capacitación digital", monto: 280, fecha: "2025-01-30" },
    { id: 31, nombre: "streaming", descripcion: "Suscripción mensual a plataforma", monto: 190, fecha: "2025-01-31" },
    { id: 32, nombre: "videojuegos", descripcion: "Compra de juegos y contenido digital", monto: 1500, fecha: "2025-02-01" },
    { id: 33, nombre: "papeleria", descripcion: "Materiales de oficina y papelería", monto: 65, fecha: "2025-02-02" },
    { id: 34, nombre: "jardineria", descripcion: "Plantas y herramientas de jardín", monto: 340, fecha: "2025-02-03" },
    { id: 35, nombre: "pizza", descripcion: "Cena familiar de pizza", monto: 480, fecha: "2025-02-04" },
    { id: 36, nombre: "cafe", descripcion: "Café y pastelería", monto: 125, fecha: "2025-02-05" },
    { id: 37, nombre: "museo", descripcion: "Entrada al museo y tour guiado", monto: 80, fecha: "2025-02-06" },
    { id: 38, nombre: "teatro", descripcion: "Boletos para obra teatral", monto: 650, fecha: "2025-02-07" },
    { id: 39, nombre: "concierto", descripcion: "Entrada a concierto musical", monto: 2200, fecha: "2025-02-08" },
    { id: 40, nombre: "spa", descripcion: "Tratamientos de relajación y belleza", monto: 1850, fecha: "2025-02-09" },
    { id: 41, nombre: "floristeria", descripcion: "Arreglo floral para evento", monto: 220, fecha: "2025-02-10" },
    { id: 42, nombre: "jugueteria", descripcion: "Juguetes y entretenimiento infantil", monto: 890, fecha: "2025-02-11" },
    { id: 43, nombre: "muebleria", descripcion: "Muebles para el hogar", monto: 12500, fecha: "2025-02-12" },
    { id: 44, nombre: "decoracion", descripcion: "Artículos decorativos para casa", monto: 760, fecha: "2025-02-13" },
    { id: 45, nombre: "electronica", descripcion: "Dispositivos electrónicos y gadgets", monto: 8900, fecha: "2025-02-14" },
    { id: 46, nombre: "deportes", descripcion: "Equipamiento deportivo y ropa", monto: 1400, fecha: "2025-02-15" },
    { id: 47, nombre: "mascotas", descripcion: "Alimento y accesorios para mascotas", monto: 320, fecha: "2025-02-16" },
    { id: 48, nombre: "reparaciones", descripcion: "Servicios de reparación doméstica", monto: 680, fecha: "2025-02-17" },
    { id: 49, nombre: "laboratorio", descripcion: "Análisis clínicos y estudios médicos", monto: 540, fecha: "2025-02-18" },
    { id: 50, nombre: "notaria", descripcion: "Trámites notariales y documentos", monto: 1100, fecha: "2025-02-19" }
]




const columns = [
    {
        accessorKey: 'id',
        header: 'Id',
        cell: (info: CellContext<Test, unknown>) => info.getValue()
    },
    {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: (info: CellContext<Test, unknown>) => info.getValue()
    },
    {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: (info: CellContext<Test, unknown>) => info.getValue()
    },
    {
        accessorKey: 'monto',
        header: 'Monto',
        cell: (info: CellContext<Test, unknown>) => info.getValue()
    },
    {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: (info: CellContext<Test, unknown>) => dayjs(info.getValue() as string).format("DD/MM/YYYY")
    }
]

const Table = () => {
    const data = testData

    const [sorting, setSorting] = useState<SortingState>([])
    const [filter,setFilter] = useState("")

    const table = useReactTable({
        data,
        columns,
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
            <input className='border border-gray-300' type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder='Buscar...'/>
            <table className='border border-gray-300 w-full'>
                <thead className='bg-black text-white p-1'>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th className='text-start'
                                 key={header.id} 
                                 onClick={header.column.getToggleSortingHandler()}>
                                    {header.isPlaceholder ?  null : (
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
                        table.getRowModel().rows.map(row => (
                            <tr className='' key={row.id}>
                                {
                                    row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
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
            <button className='border border-gray-200 p-1 cursor-pointer' onClick={() => table.setPageIndex(0)}>
                Primer pagina
            </button>
            <button className='border border-gray-200 p-1 cursor-pointer'onClick={() => table.previousPage()}>
                Anterior
            </button>
            <button className='border border-gray-200 p-1 cursor-pointer'onClick={() => table.nextPage()}>
                Siguiente
            </button>
            <button className='border border-gray-200 p-1 cursor-pointer' onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
                Ultima pagina
            </button>
            </div>
        </div>
    )
}

export default Table