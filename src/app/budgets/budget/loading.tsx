import { loadingSkeleton } from "@/components/loadingSkeleton"

const Loading = () => {
    return (
        <>
            {loadingSkeleton("Cargando generador de presupuesto...")}
        </>
    )
}

export default Loading

