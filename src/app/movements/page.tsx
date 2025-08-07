import Table from "../components/table"

const columns = [
    {
        accessorKey: 'debe',
        header: 'Debe'
    },
    {
        accessorKey: 'Haber',
        header: 'Haber'
    },
    {
        accessorKey: 'fecha',
        header: 'Fecha'
    },
    {
      accessorKey: 'detalle',
      header: 'Detalle'
  }
  ]

const EccountingEntry = () => {
  return (
    <div className="flex justify-center items-center">
      <Table columns={columns}/>
    </div>
  )
}

export default EccountingEntry