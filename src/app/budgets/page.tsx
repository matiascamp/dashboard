import Link from "next/link"


const Budget = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center gap-5">
        <Link href="budgets/budget">Crear presupuesto</Link>
        <Link href="#">Presupuestos creados</Link>
    </div>
  )
}

export default Budget
