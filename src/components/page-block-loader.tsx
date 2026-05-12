'use client'

import { Loader2 } from 'lucide-react'

type PageBlockLoaderProps = {
  label?: string
  className?: string
}

export function PageBlockLoader({ label = 'Cargando...', className = '' }: PageBlockLoaderProps) {
  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center gap-3 text-[var(--foreground-secondary)] ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" aria-hidden />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
