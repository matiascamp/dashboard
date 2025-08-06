import Link from "next/link"
import { useState } from "react"


const SideBar = () => {

    // const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="sideBar flex flex-col items-start justify-between min-h-screen p-5 w-64 gap-5">
            <div className="border border-gray-200">
                Nombre de usuario
            </div>
            <div className="flex flex-col gap-5">
                <Link href="/debts">
                    Asiento contable
                </Link>
                <Link href="/">
                    Presupuestos
                </Link>
            </div>
            <button>
                Salir/loguearse
            </button>
        </div>
    )
}

export default SideBar