'use client'
import React from 'react'
import Table from '../../../components/table'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageBlockLoader } from '@/components/page-block-loader'
import { FileSearch, Calendar, DollarSign, FileText, Loader2, Pencil, Trash2, X, Save } from 'lucide-react'
import { ColumnsProps } from '@/interfaces'
import { toast } from 'sonner'

type Movement = {
  id: number
  name: string
  description: string
  amount: number
  type: 'incoming' | 'outcoming'
  date: string
  currency?: string
  dollarRate?: number | null
  amountOriginal?: number | null
  invoice?: "a facturar" | "no factura"
}

 type MovementFormData = {
   name: string
   description: string
   amount: number
   type: 'incoming' | 'outcoming'
   dollarRate: number
   amountOriginal: number
   invoice: "a facturar" | "no factura"
 }

const getMonthName = (monthNumber: string) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[parseInt(monthNumber) - 1] || monthNumber
}

const MovementsDetails = () => {
  const params = useParams()
  const yearMonth = params['year-month']

  const [details, setDetails] = useState<Movement[]>([])
  const [editingMovement, setEditingMovement] = useState<Movement | null | false>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(true)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
const [editFormData, setEditFormData] = useState<MovementFormData>({
    name: '',
    description: '',
    amount: 0,
    type: 'incoming',
    dollarRate: 0,
    amountOriginal: 0,
    invoice: 'a facturar',
})

  const [periodInfo, setPeriodInfo] = useState({ year: '', month: '' })
const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'a facturar' | 'no factura'>('all')
const filteredDetails = useMemo(() => details.filter(m => {
  if (invoiceFilter === 'all') return true
  const normalized = m.invoice ?? '-'
  if (normalized === '-') return invoiceFilter === 'a facturar' // null/empty treat as default
  return normalized === invoiceFilter
}), [details, invoiceFilter])

  const loadDetails = useCallback(async (year: string, month: string) => {
    setIsFetchingDetails(true)
    try {
      const res = await fetch(`/api/details?year=${year}&month=${month}`)
      const data = await res.json()
      if (!res.ok) throw new Error('No se pudieron cargar los movimientos')
      setDetails(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading details:', error)
      setDetails([])
      toast.error('No se pudieron cargar los movimientos')
    } finally {
      setIsFetchingDetails(false)
    }
  }, [])

  useEffect(() => {
    if (!yearMonth) return
    const [year, month] = String(yearMonth).split('-')
    setPeriodInfo({ year, month })
    setDetails([])
    loadDetails(year, month)
  }, [yearMonth, loadDetails])

  const onEditClick = useCallback((movement: Movement) => {
    setEditingMovement(movement);
    const isUsd = movement.currency === 'USD';
    setEditFormData({
      name: movement.name,
      description: movement.description,
      amount: movement.amount,
      type: movement.type,
      dollarRate: isUsd ? (movement.dollarRate ?? 0) : 0,
      amountOriginal: isUsd ? (movement.amountOriginal ?? 0) : 0,
      invoice: (movement as any).invoice ?? 'a facturar',
    });
  }, []);

  const onDeleteClick = useCallback(async (movementId: number) => {
    const confirmed = window.confirm('¿Querés eliminar este movimiento?')
    if (!confirmed) return

    setIsDeletingId(movementId)
    try {
      const res = await fetch(`/api/details/${movementId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('No se pudo eliminar el movimiento')
      setDetails(prev => prev.filter(item => item.id !== movementId))
      toast.success('Movimiento eliminado')
    } catch (error) {
      console.error('Error deleting movement:', error)
      toast.error('No se pudo eliminar el movimiento')
    } finally {
      setIsDeletingId(null)
    }
  }, [])

  const onSaveEdit = async () => {
    if (!editingMovement) return

    const isUsd = editingMovement.currency === 'USD'
    if (isUsd) {
      if (!editFormData.dollarRate || editFormData.dollarRate <= 0) {
        toast.error('La cotización del dólar debe ser mayor a 0')
        return
      }
      if (!editFormData.amountOriginal || editFormData.amountOriginal <= 0) {
        toast.error('El monto en dólares debe ser mayor a 0')
        return
      }
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/details/${editingMovement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          amount: isUsd
            ? editFormData.amountOriginal * editFormData.dollarRate
            : editFormData.amount,
          invoice: editFormData.invoice,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(typeof errBody?.error === 'string' ? errBody.error : 'No se pudo actualizar el movimiento')
      }

      const [year, month] = [periodInfo.year, periodInfo.month]
      if (year && month) await loadDetails(year, month)

      setEditingMovement(null)
      toast.success('Movimiento actualizado')
    } catch (error) {
      console.error('Error updating movement:', error)
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el movimiento')
    } finally {
      setIsSaving(false)
    }
  }

  const columns: ColumnsProps[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Concepto'
    },
    {
      accessorKey: 'description',
      header: 'Descripción'
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: (info) => info.getValue() === 'incoming' ? 'Ingreso' : 'Egreso',
    },
    {
      accessorFn: (row: Movement) => (row.invoice ?? '-'),
      accessorKey: 'invoice',
      header: 'Factura',
      cell: (info) => {
        const value = info.getValue() as string | null | undefined
        const displayText = !value || value === '' ? '-' : value === 'a facturar' ? 'A facturar' : value === 'no factura' ? 'No factura' : value
        return (
          <span className="inline-flex items-center justify-center min-w-[80px] px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 whitespace-nowrap">
            {displayText}
          </span>
        )
      }
    },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: (info) => {
        const row = info.row.original as Movement
        const ars = Number(info.getValue())
        return (
          <div className="flex flex-col items-center gap-0.5 text-left">
            <span className="font-medium">
              ${ars.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
            </span>
            {row.currency === 'USD' &&
              row.dollarRate != null &&
              row.amountOriginal != null && (
                <span className="text-xs text-[var(--foreground-muted)]">
                  U$S{' '}
                  {row.amountOriginal.toLocaleString('es-AR', { maximumFractionDigits: 2 })} · cotización{' '}
                  ${row.dollarRate.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </span>
              )}
          </div>
        )
      },
    },
        {
      accessorKey: 'date',
      header: 'Fecha'
    },
    {
      accessorKey: 'actions',
      header: 'Acciones',
      cell: (info) => {
        const row = info.row.original as Movement
        const rowDeleting = isDeletingId === row.id
        const rowBusy = rowDeleting || isSaving
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={rowBusy}
              className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-3 py-1 text-sm hover:bg-[var(--background-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onEditClick(row)}
            >
              <Pencil size={14} />
              <span>Editar</span>
            </button>
            <button
              type="button"
              disabled={rowBusy}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-sm text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onDeleteClick(Number(row.id))}
            >
              {rowDeleting ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <Trash2 size={14} />
              )}
              <span>{rowDeleting ? 'Eliminando...' : 'Eliminar'}</span>
            </button>
          </div>
        )
      },
    }
  ], [[isDeletingId, isSaving, onEditClick, onDeleteClick]])


  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)]">
      <div className="container mx-auto px-6 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
              <FileSearch className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--foreground)]">
              Detalle de Movimientos
            </h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto mb-8 animate-scale-in">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Período Seleccionado
                  </h3>
                  <p className="text-[var(--foreground-secondary)]">
                    {getMonthName(periodInfo.month)} {periodInfo.year}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--foreground-muted)]">Total de movimientos</p>
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {details.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        {isFetchingDetails && details.length === 0 ? (
          <PageBlockLoader label="Cargando movimientos del período..." />
        ) : details.length > 0 ? (
          <div className="relative animate-fade-in">
            <div className="flex items-center justify-between mb-4">
          <div>
            {/* Optional filter description */}
          </div>
          <div className="flex space-x-2">
            <button onClick={()=>setInvoiceFilter('all')} className={`inline-flex items-center justify-center min-w-[70px] px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out ${invoiceFilter === 'all' ? 'bg-[var(--primary)] text-white' : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'}`}>
              Todos ({details.length})
            </button>
            <button onClick={()=>setInvoiceFilter('a facturar')} className={`inline-flex items-center justify-center min-w-[70px] px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out ${invoiceFilter === 'a facturar' ? 'bg-yellow-500 text-white' : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'}`}>
              A facturar ({details.filter(m => m.invoice === 'a facturar').length})
            </button>
            <button onClick={() => setInvoiceFilter('no factura')} className={`inline-flex items-center justify-center min-w-[70px] px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out ${invoiceFilter === 'no factura' ? 'bg-green-500 text-white' : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'}`}>
              No factura ({details.filter(m => m.invoice === 'no factura').length})
            </button>
          </div>
        </div>
        <Table columns={columns} data={filteredDetails} />
            {isFetchingDetails && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--background)]/70 backdrop-blur-[1px]"
                aria-busy="true"
                aria-live="polite"
              >
                <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-6 py-4 shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" aria-hidden />
                  <span className="text-sm font-medium text-[var(--foreground-secondary)]">Actualizando...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-[var(--background-tertiary)] rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-12 w-12 text-[var(--foreground-muted)]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-[var(--foreground)]">
                  No hay movimientos registrados
                </h3>
                <p className="text-[var(--foreground-secondary)] max-w-md mx-auto">
                  No se encontraron movimientos para el período de {getMonthName(periodInfo.month)} {periodInfo.year}.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="/incoming-outcoming"
                  className="
                    inline-flex items-center space-x-2 px-6 py-3
                    bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                    text-[var(--primary-foreground)] font-semibold
                    rounded-xl
                    transition-all duration-200
                    transform hover:scale-105"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Registrar movimiento</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      {editingMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-lg)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Editar movimiento</h2>
              <button
                type="button"
                onClick={() => setEditingMovement(null)}
                disabled={isSaving}
                className="rounded-lg border border-[var(--border)] p-2 hover:bg-[var(--background-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <fieldset disabled={isSaving} className="space-y-4 min-w-0 border-0 p-0 m-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-name">
                  Concepto
                </label>
                <input
                  id="edit-name"
                  value={editFormData.name}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-description">
                  Descripción
                </label>
                <textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={e => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-invoice">
                  Factura
                </label>
                <select
                  id="edit-invoice"
                  value={(editFormData.invoice as any) ?? 'a facturar'}
                  onChange={e => setEditFormData(prev => ({ ...prev, invoice: e.target.value as "a facturar" | "no factura" }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                >
                  <option value="a facturar">A facturar</option>
                  <option value="no factura">No factura</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {editingMovement.currency === 'USD' ? (
                  <>
                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-amount-usd">
                        Monto (USD)
                      </label>
                      <input
                        id="edit-amount-usd"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editFormData.amountOriginal || ''}
                        onChange={e =>
                          setEditFormData(prev => ({
                            ...prev,
                            amountOriginal: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-dollar-rate">
                        Cotización del dólar (ARS por USD)
                      </label>
                      <input
                        id="edit-dollar-rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editFormData.dollarRate || ''}
                        onChange={e =>
                          setEditFormData(prev => ({
                            ...prev,
                            dollarRate: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                      />
                    </div>
                    <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-3 text-sm text-[var(--foreground-secondary)]">
                      Equivalente en ARS:{' '}
                      <span className="font-semibold text-[var(--foreground)]">
                        $
                        {(editFormData.amountOriginal * editFormData.dollarRate).toLocaleString('es-AR', {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-amount">
                      Monto (ARS)
                    </label>
                    <input
                      id="edit-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={e => setEditFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                    />
                  </div>
                )}
                <div className={`space-y-2 ${editingMovement.currency === 'USD' ? 'md:col-span-2' : ''}`}>
                  <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="edit-type">
                    Tipo
                  </label>
                  <select
                    id="edit-type"
                    value={editFormData.type}
                    onChange={e => setEditFormData(prev => ({ ...prev, type: e.target.value as 'incoming' | 'outcoming' }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
                  >
                    <option value="incoming">Ingreso</option>
                    <option value="outcoming">Egreso</option>
                  </select>
                </div>
              </div>
            </div>
            </fieldset>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMovement(null)}
                disabled={isSaving}
                className="rounded-xl border border-[var(--border)] px-4 py-2 font-medium hover:bg-[var(--background-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                ) : (
                  <Save size={16} />
                )}
                <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovementsDetails