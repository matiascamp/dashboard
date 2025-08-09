'use client'
import { useEffect, useState } from "react"
import Table from "../../components/table"

const columns = [
  {
    accessorKey: 'debit',
    header: 'Debe'
  },
  {
    accessorKey: 'havings',
    header: 'Haber'
  },
  {
    accessorKey: 'monthYear',
    header: 'Fecha'
  },

  {
    accessorKey: 'detail',
    header: 'Detalle'
  }
]

type Summary = {
  year: number
  month: number
  debit: number
  havings: number
}


const EccountingEntry = () => {

  const [summaries, setSummaries] = useState<Summary[]>([])

  
  useEffect(() => {
   ( async () => {
      const response = await fetch('/api/summaries')
      const data = await response.json()
      setSummaries(data)
    })()
  },[])


  return (
    <div className="flex justify-center items-center">
      <Table columns={columns} data={summaries}/>
    </div>
  )
}

export default EccountingEntry