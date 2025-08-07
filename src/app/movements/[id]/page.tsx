'use server'
import React from 'react'
import Table from '../../components/table'


const columns = [
  {
      accessorKey: 'id',
      header: 'Id'
  },
  {
      accessorKey: 'nombre',
      header: 'Nombre'
  },
  {
      accessorKey: 'descripcion',
      header: 'Descripción'
  },
  {
      accessorKey: 'monto',
      header: 'Monto'
  },
  {
      accessorKey: 'fecha',
      header: 'Fecha'
  }
]


const MovementsDetails = () => {
  return (
    <div className='flex justify-center items-center'>
      <Table columns={columns}/>
    </div>
  )
}

export default MovementsDetails
