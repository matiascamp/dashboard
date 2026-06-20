'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Table from '../../../components/table';
import { useParams } from 'next/navigation';
import { PageBlockLoader } from '@/components/page-block-loader';
import { FileSearch, Calendar, DollarSign, FileText, Loader2, Pencil, Trash2, X, Save, Check } from 'lucide-react';
import { ColumnsProps } from '@/interfaces';
import { toast } from 'sonner';

// Defines a Movement object structure.
type BaseMovement = {
  id: number;
  name: string;
  description: string;
  amount: number;
  type: 'incoming' | 'outcoming';
  date: string;
  currency?: string;
  dollarRate?: number | null;
  amountOriginal?: number | null;
  invoice?: "a facturar" | "no factura";
};

type Movement = BaseMovement & Record<string, unknown>;

type MovementFormData = {
  name: string;
  description: string;
  amount: number;
  type: 'incoming' | 'outcoming';
  dollarRate: number;
  amountOriginal: number;
  invoice: "a facturar" | "no factura";
} & Record<string, unknown>;

const getMonthName = (monthNumber: string): string => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[parseInt(monthNumber) - 1] || monthNumber;
}

const MovementsDetails = () => {
  const params = useParams<{ 'year-month': string }>();
  const yearMonth = params['year-month'];

  const [details, setDetails] = useState<Movement[]>([]);
  const [editingMovement, setEditingMovement] = useState<Movement | false | null>(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const [editFormData, setEditFormData] = useState<MovementFormData>({
    name: '',
    description: '',
    amount: 0,
    type: 'incoming',
    dollarRate: 0,
    amountOriginal: 0,
    invoice: 'a facturar',
  });

  const [periodInfo, setPeriodInfo] = useState<{ year: string; month: string }>({ year: '', month: '' });
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'a facturar' | 'no factura'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDetails = useMemo(() => details.filter(m => {
    if (invoiceFilter === 'all') return true;
    const normalized = m.invoice ?? '-';
    if (normalized === '-') return invoiceFilter !== 'a facturar';
    return normalized === invoiceFilter;
  }), [details, invoiceFilter]);

  const loadDetails = useCallback(async (year: string, month: string) => {
    try {
      const res = await fetch(`/api/details?year=${year}&month=${month}`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error('No se pudieron cargar los movimientos');
      setDetails(data);
    } catch (error) {
      console.error('Error loading details:', error);
      setDetails([]);
      toast.error('No se pudieron cargar los movimientos');
    } finally {
      setIsFetchingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (!yearMonth || typeof yearMonth !== 'string') return;
    const [year, month] = String(yearMonth).split('-');
    setPeriodInfo({ year, month });
    setDetails([]);
    loadDetails(year, month);
  }, [yearMonth, loadDetails]);

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
      invoice: (movement.invoice as "a facturar" | "no factura") || 'a facturar',
    });
  }, []);

  const onDeleteClick = useCallback(async (movementId: number) => {
    if (!confirm('¿Querés eliminar este movimiento? Esta acción no se puede revertir.')) return;

    setIsDeletingId(movementId);
    try {
      const res = await fetch(`/api/details/${movementId}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('No se pudo eliminar el movimiento');

      setDetails(prev => prev.filter(item => item.id !== movementId));
      toast.success('Movimiento eliminado');
    } catch (error) {
      console.error('Error deleting movement:', error);
      toast.error('No se pudo eliminar el movimiento');
    } finally {
      setIsDeletingId(null);
    }
  }, []);

  const onSaveEdit = async () => {
    if (editingMovement === null || editingMovement === false) return;

    const isUsd = editingMovement.currency === 'USD';
    let validationError: string | undefined;

    if (isUsd && (!editFormData.dollarRate || editFormData.dollarRate <= 0)) {
      validationError = 'La cotización del dólar debe ser mayor a 0.';
    } else if (isUsd && (!editFormData.amountOriginal || editFormData.amountOriginal <= 0)) {
      validationError = 'El monto en dólares debe ser mayor a 0.';
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...editFormData,
        amount: isUsd
          ? editFormData.amountOriginal * editFormData.dollarRate
          : editFormData.amount,
        invoice: editFormData.invoice,
      };

      const res = await fetch(`/api/details/${editingMovement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorResponse = await res.json().catch(() => ({ error: 'Error desconocido al actualizar.' }));
        const errorDetails = errorResponse;
        const errorMessage = typeof errorDetails?.error === 'string' 
          ? String(errorDetails.error) 
          : 'No se pudo actualizar el movimiento';
        throw new Error(errorMessage);
      }

      setEditingMovement(null);
      setDetails(prev => prev.map(item => 
        item.id === editingMovement.id ? { ...item, ...editFormData } as Movement : item
      ));
      toast.success('Movimiento actualizado');
    } catch (error) {
      console.error('Error saving movement:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el movimiento');
    } finally {
      setIsSaving(false);
    }
  };

  const onCancelEdit = useCallback(() => {
    setEditingMovement(null);
  }, []);

  // Build columns for the table - ColumnsProps uses accessorKey and header
  const columns: ColumnsProps[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'description', header: 'Descripción' },
    { accessorKey: 'amount', header: 'Monto' },
    { accessorKey: 'type', header: 'Tipo' },
    { accessorKey: 'date', header: 'Fecha' },
    { accessorKey: 'invoice', header: 'Factura' },
    { 
      accessorKey: 'actions', 
      header: 'Acciones',
      cell: (info: any) => {
        const movement = info.row.original as Movement;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(movement);
              }}
              disabled={isDeletingId === movement.id}
              className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors duration-200 disabled:opacity-50"
              title="Editar movimiento"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(movement.id);
              }}
              disabled={isDeletingId === movement.id}
              className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50"
              title="Eliminar movimiento"
            >
              {isDeletingId === movement.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        );
      }
    },
  ];

  // Map movements to table rows with year/month for the detail link
  const tableData = useMemo(() => filteredDetails.map(m => ({
    ...m,
    year: periodInfo.year,
    month: periodInfo.month,
  })), [filteredDetails, periodInfo]);

  // Calculate summary values
  const totalIncoming = useMemo(() => 
    filteredDetails.filter(m => m.type === 'incoming').reduce((sum, m) => sum + m.amount, 0),
    [filteredDetails]
  );

  const totalOutgoing = useMemo(() => 
    filteredDetails.filter(m => m.type === 'outcoming').reduce((sum, m) => sum + m.amount, 0),
    [filteredDetails]
  );

  const balance = totalIncoming - totalOutgoing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)]">
      <div className="container mx-auto px-6 py-8">
        {isFetchingDetails && !yearMonth ? (
          <PageBlockLoader label="Cargando movimientos..." />
        ) : (
          <>
            <header className="text-center mb-8 animate-fade-in">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                  <Calendar className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">
                  Movimientos de {getMonthName(periodInfo.month)} {periodInfo.year}
                </h1>
              </div>
            </header>

            {/* Filter and Summary Cards */}
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--foreground)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200 cursor-pointer font-medium min-w-[180px] text-left"
                >
                  <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)] pointer-events-none" />
                  <span className="flex-1">
                    {invoiceFilter === 'all' ? 'Todos' : invoiceFilter === 'a facturar' ? 'A facturar' : 'No factura'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Custom dropdown menu */}
                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden z-50 min-w-[180px] animate-scale-in">
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: 'a facturar', label: 'A facturar' },
                      { value: 'no factura', label: 'No factura' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setInvoiceFilter(option.value as 'all' | 'a facturar' | 'no factura');
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors duration-200 ${
                          invoiceFilter === option.value
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                            : 'text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                        }`}
                      >
                        {invoiceFilter === option.value && (
                          <Check className="w-4 h-4" />
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Cards */}
              <div className="flex items-center gap-3">
                {/* Ingresos Card */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  totalIncoming >= 0 
                    ? 'bg-[var(--success-bg)] border-[var(--success-border)]' 
                    : 'bg-[var(--error-bg)] border-[var(--error-border)]'
                }`}>
                  <DollarSign className={`w-6 h-6 ${totalIncoming >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`} />
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Ingresos</p>
                    <p className={`text-lg font-bold ${totalIncoming >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                      ${totalIncoming.toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* Gastos Card */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  totalOutgoing >= 0 
                    ? 'bg-[var(--error-bg)] border-[var(--error-border)]' 
                    : 'bg-[var(--success-bg)] border-[var(--success-border)]'
                }`}>
                  <DollarSign className={`w-6 h-6 ${totalOutgoing >= 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`} />
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Gastos</p>
                    <p className={`text-lg font-bold ${totalOutgoing >= 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                      ${totalOutgoing.toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* Balance Card */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${
                  balance >= 0 
                    ? 'bg-[var(--success-bg)] border-[var(--success)]' 
                    : 'bg-[var(--error-bg)] border-[var(--error)]'
                }`}>
                  <FileText className={`w-6 h-6 ${balance >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`} />
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Balance</p>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                      ${balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table with editing capability */}
            <div className="animate-fade-in">
              <Table columns={columns} data={tableData} total={undefined} />
            </div>

            {/* Inline editing section for the selected movement */}
            {editingMovement && (
              <div className="mt-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Editar movimiento</h2>
                  <button
                    onClick={onCancelEdit}
                    className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nombre</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Descripción</label>
                    <input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Monto</label>
                    <input
                      type="number"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Tipo</label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'incoming' | 'outcoming' })}
                      className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                    >
                      <option value="incoming">Ingreso</option>
                      <option value="outcoming">Gasto</option>
                    </select>
                  </div>
                  {editingMovement.currency === 'USD' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Cotización USD</label>
                        <input
                          type="number"
                          value={editFormData.dollarRate}
                          onChange={(e) => setEditFormData({ ...editFormData, dollarRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Monto USD</label>
                        <input
                          type="number"
                          value={editFormData.amountOriginal}
                          onChange={(e) => setEditFormData({ ...editFormData, amountOriginal: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Factura</label>
                    <select
                      value={editFormData.invoice}
                      onChange={(e) => setEditFormData({ ...editFormData, invoice: e.target.value as "a facturar" | "no factura" })}
                      className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200"
                    >
                      <option value="a facturar">A facturar</option>
                      <option value="no factura">No factura</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={onSaveEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--border)] text-[var(--foreground)] rounded-xl hover:bg-[var(--border)]/80 transition-all duration-200 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {filteredDetails.length === 0 && !isFetchingDetails && (
              <div className="text-center py-12 text-[var(--foreground-muted)] animate-fade-in">
                <FileSearch className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No se encontraron movimientos para este período.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MovementsDetails;