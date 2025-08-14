
export const loadingSkeleton = (msj:string) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
            <div className="text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
                <p className="text-[var(--foreground-secondary)]">{msj}</p>
            </div>
        </div>
    )
}