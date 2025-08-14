import { loadingSkeleton } from "@/components/loadingSkeleton"

const Loading = () => {
    return (
        <>
            {loadingSkeleton("Cargando formulario...")}
        </>
    )
}

export default Loading

