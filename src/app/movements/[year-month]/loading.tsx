import { loadingSkeleton } from "@/components/loadingSkeleton"

const Loading = () => {
    return (
        <>
            {loadingSkeleton("Cargando detalles del período...")}
        </>
    )
}

export default Loading

