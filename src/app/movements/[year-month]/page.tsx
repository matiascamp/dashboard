'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Table from '../../../components/table';
import { useParams } from 'next/navigation';
import { PageBlockLoader } from '@/components/page-block-loader';
import { FileSearch, Calendar, DollarSign, FileText, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { ColumnsProps } from '@/interfaces';
import { toast } from 'sonner';

// Defines a Movement object structure. We use an extended type to capture necessary dynamic keys if the API returns extra fields.
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

// We use a local Movement type that combines the base structure with flexible key access to mitigate immediate TypeScript warnings without resorting to 'any' globally.
type Movement = BaseMovement & { [key: string]: any };

type MovementFormData = {
  name: string;
  description: string;
  amount: number;
  type: 'incoming' | 'outcoming';
  dollarRate: number;
  amountOriginal: number;
  invoice: "a facturar" | "no factura";
} & { [key: string]: any };

const getMonthName = (monthNumber: string): string => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[parseInt(monthNumber) - 1] || monthNumber;
}

const MovementsDetails = () => {
  const params = useParams<{ 'year-month': string }>();
  // The params['year-month'] should be a string like "2024-06"
  const yearMonth = params['year-month'];

  const [details, setDetails] = useState<Movement[]>([]);
  // Initialize editing movement to null (no item selected for edit) or false (indicating potential initial state/failure).
  const [editingMovement, setEditingMovement] = useState<Movement | false | null>(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Form data for editing a movement. Initialize with safe default values.
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

  // Derived state calculation (Memoized to avoid unnecessary recalculations)
  const filteredDetails = useMemo(() => details.filter(m => {
    if (invoiceFilter === 'all') return true;
    const normalized = m.invoice ?? '-';
    if (normalized === '-') return invoiceFilter !== 'a facturar'; // null/empty treat as anything but default filter
    return normalized === invoiceFilter;
  }), [details, invoiceFilter]);

  // Data fetching logic using useCallback for stability in useEffect dependency array
  const loadDetails = useCallback(async (year: string, month: string) => {
    setIsFetchingDetails(true);
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

  // Effect hook to load data when yearMonth changes (i.e., component mounts or path params change)
  useEffect(() => {
    if (!yearMonth || typeof yearMonth !== 'string') return;
    const [year, month] = String(yearMonth).split('-');
    setPeriodInfo({ year, month });
    setDetails([]); // Clear details when period changes
    loadDetails(year, month);
  }, [yearMonth, loadDetails]);

  // Handler to set up the form for editing a specific movement. Type assertion is used here to safely access potentially undefined/dynamic keys.
  const onEditClick = useCallback((movement: Movement) => {
    setEditingMovement(movement);
    // Determine if USD mode should be active based on current selection
    const isUsd = movement.currency === 'USD'; 
    setEditFormData({
      name: movement.name,
      description: movement.description,
      amount: movement.amount,
      type: movement.type,
      // Use nullish coalescing (??) for safe access with default values
      dollarRate: isUsd ? (movement.dollarRate ?? 0) : 0,
      amountOriginal: isUsd ? (movement.amountOriginal ?? 0) : 0,
      invoice: movement.invoice || 'a facturar',
    });
  }, []);

  // Handler for deleting a movement
  const onDeleteClick = useCallback(async (movementId: number) => {
    if (!confirm('¿Querés eliminar este movimiento? Esta acción no se puede revertir.')) return;

    setIsDeletingId(movementId);
    try {
      const res = await fetch(`/api/details/${movementId}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('No se pudo eliminar el movimiento');

      // Optimistically update the local state only if deletion succeeds
      setDetails(prev => prev.filter(item => item.id !== movementId));
      toast.success('Movimiento eliminado');
    } catch (error) {
      console.error('Error deleting movement:', error);
      toast.error('No se pudo eliminar el movimiento');
    } finally {
      setIsDeletingId(null);
    }
  }, []);

  // Handler for saving edited movement data.
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
      const payload: any = {
        ...editFormData,
        amount: isUsd
          ? editFormData.amountOriginal * editFormData.dollarRate // Recalculate ARS amount based on USD components
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
        const errBody = await res.json().catch(() => ({ error: 'Error desconocido al actualizar.' }));
        const errorMessage = (typeof errBody?.error === 'string' 
          ? errBody.error 
          : 'No se pudo actualizar el movimiento') as string;
        throw new Error(errorMessage);
