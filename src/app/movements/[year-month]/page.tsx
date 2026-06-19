'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Table from '../../../components/table';
import { useParams } from 'next/navigation';
import { PageBlockLoader } from '@/components/page-block-loader';
import { FileSearch, Calendar, DollarSign, FileText, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
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
    { accessorKey: 'actions', header: 'Acciones' },
  ];

  // Map movements to table rows with year/month for the detail link
  const tableData = useMemo(() => filteredDetails.map(m => ({
    ...m,
    year: periodInfo.year,
    month: periodInfo.month,
  })), [filteredDetails, periodInfo]);

  return (
    <div className="p-6 space-y-4">
      {isFetchingDetails && !yearMonth ? (
        <PageBlockLoader label="Cargando movimientos..." />
      ) : (
        <>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Movimientos de {getMonthName(periodInfo.month)} {periodInfo.year}
          </h1>
          <div className="flex gap-2">
            <select
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value as 'all' | 'a facturar' | 'no factura')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todos</option>
              <option value="a facturar">A facturar</option>
              <option value="no factura">No factura</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Total Ingresos</p>
              <p className="text-xl font-bold text-green-800">
                ${filteredDetails.filter(m => m.type === 'incoming').reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-600">Total Gastos</p>
              <p className="text-xl font-bold text-red-800">
                ${filteredDetails.filter(m => m.type === 'outcoming').reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Balance</p>
              <p className="text-xl font-bold text-blue-800">
                ${(filteredDetails.filter(m => m.type === 'incoming').reduce((sum, m) => sum + m.amount, 0) -
                   filteredDetails.filter(m => m.type === 'outcoming').reduce((sum, m) => sum + m.amount, 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Table with editing capability */}
        <Table columns={columns} data={tableData} total={undefined} />

        {/* Inline editing section for the selected movement */}
        {editingMovement && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Editar movimiento</h2>
              <button
                onClick={onCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'incoming' | 'outcoming' })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="incoming">Ingreso</option>
                  <option value="outcoming">Gasto</option>
                </select>
              </div>
              {editingMovement.currency === 'USD' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cotización USD</label>
                    <input
                      type="number"
                      value={editFormData.dollarRate}
                      onChange={(e) => setEditFormData({ ...editFormData, dollarRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto USD</label>
                    <input
                      type="number"
                      value={editFormData.amountOriginal}
                      onChange={(e) => setEditFormData({ ...editFormData, amountOriginal: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factura</label>
                <select
                  value={editFormData.invoice}
                  onChange={(e) => setEditFormData({ ...editFormData, invoice: e.target.value as "a facturar" | "no factura" })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a facturar">A facturar</option>
                  <option value="no factura">No factura</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={onSaveEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={onCancelEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Action buttons for each row (shown after the table) */}
        {filteredDetails.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <button
              onClick={() => onEditClick(item)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteClick(item.id)}
              disabled={isDeletingId === item.id}
              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {isDeletingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}

        {filteredDetails.length === 0 && !isFetchingDetails && (
          <div className="text-center py-8 text-gray-500">
            <FileSearch className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No se encontraron movimientos para este período.</p>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default MovementsDetails;