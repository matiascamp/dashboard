'use client'
import React from 'react'
import Table from '../../../components/table'
import { useParams } from 'next/navigation'

import { useEffect, useState } from 'react'
const columns = [
  {
      accessorKey: 'name',
      header: 'Nombre'
  },
  {
      accessorKey: 'description',
      header: 'Descripción'
  },
  {
      accessorKey: 'amount',
      header: 'Monto'
  },
  {
      accessorKey: 'date',
      header: 'Fecha'
  }
]


const MovementsDetails = () => {

  const params = useParams()
  const yearMonth = params['year-month'] // ej: "2025-08"
  console.log("yearmont",yearMonth);
  
  const [details, setDetails] = useState([])


  useEffect(() => {
    if (!yearMonth) return

    const [year, month] = yearMonth.split('-')

    fetch(`/api/details?year=${year}&month=${month}`)
      .then(res => res.json())
      .then(data => {
        console.log("data",data);
        
        setDetails(data)
 
      })
  }, [yearMonth])

  return (
    <div className='flex justify-center items-center'>
      <Table columns={columns} data={details}/>
    </div>
  )
}

export default MovementsDetails
