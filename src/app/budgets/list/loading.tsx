import { loadingSkeleton } from "@/components/loadingSkeleton"

const Loading = () => {
    return (
        <>
            {loadingSkeleton("Cargando presupuestos...")}
        </>
    )
}

export default Loading

