'use client'
import Table from '@/components/table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileText, Inbox, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageBlockLoader } from '@/components/page-block-loader'
import { ColumnsProps } from '@/interfaces'

interface Budgets {
  id: number
  clientName: string
  createdDate: string
  pdfUrl: string
  [key: string]: unknown
}

const BudgetList = () => {
  const [budgets, setBudgets] = useState<Budgets[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadBudgets = useCallback(async () => {
    setIsLoadingList(true)
    try {
      const response = await fetch('/api/pdf/list')
      const data = await response.json()
      if (Array.isArray(data)) {
        setBudgets(data as Budgets[])
      } else {
        setBudgets([])
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
      setBudgets([])
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const onDelete = useCallback(async (budgetId: number) => {
    const confirmed = window.confirm(
      '¿Eliminar este presupuesto? Se quitará del listado y se intentará borrar el archivo asociado.'
    )
    if (!confirmed) return

    setDeletingId(budgetId)
    try {
      const res = await fetch(`/api/pdf/${budgetId}`, { method: 'DELETE' })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(typeof errBody?.error === 'string' ? errBody.error : 'Error al eliminar')
      }
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      toast.success('Presupuesto eliminado')
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el presupuesto')
    } finally {
      setDeletingId(null)
    }
  }, [])

  const columns: ColumnsProps[] = useMemo(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Cliente',
      },
      {
        accessorKey: 'createdDate',
        header: 'Fecha de creación',
      },
      {
        accessorKey: 'pdfUrl',
        header: 'Documento',
      },
      {
        accessorKey: 'actions',
        header: 'Acciones',
        cell: info => {
          const row = info.row.original as Budgets
          const busy = deletingId === row.id
          return (
            <button
              type="button"
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-sm text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onDelete(row.id)}
            >
              {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Trash2 size={14} />}
              <span>{busy ? 'Eliminando...' : 'Eliminar'}</span>
            </button>
          )
        },
      },
    ],
    [onDelete, deletingId]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)]">
      <div className="container mx-auto px-6 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
              <FileText className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--foreground)]">Presupuestos Creados</h1>
          </div>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Historial completo de todos los presupuestos generados
          </p>
        </header>
        {isLoadingList ? (
          <PageBlockLoader label="Cargando presupuestos..." />
        ) : budgets.length > 0 ? (
          <div className="animate-scale-in">
            <Table columns={columns} data={budgets} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-[var(--background-tertiary)] rounded-full flex items-center justify-center mx-auto">
                <Inbox className="h-12 w-12 text-[var(--foreground-muted)]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-[var(--foreground)]">No hay presupuestos aún</h3>
                <p className="text-[var(--foreground-secondary)] max-w-md mx-auto">
                  Cuando cree su primer presupuesto, aparecerá aquí para que pueda revisarlo y descargarlo.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="/budgets/budget"
                  className="
                                        inline-flex items-center space-x-2 px-6 py-3
                                        bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                                        text-[var(--primary-foreground)] font-semibold
                                        rounded-xl
                                        transition-all duration-200
                                        transform hover:scale-105"
                >
                  <FileText className="h-5 w-5" />
                  <span>Crear primer presupuesto</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetList
