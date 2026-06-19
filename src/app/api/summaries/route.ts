import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MovementRecord {
  year: number;
  month: number;
  debit: number;
  havings: number;
  invoicesPending: number;
}

interface MovementSummaryResponse {
  totalDebit: number;
  totalHavings: number;
  periodsCount: number;
  invoicesPending: number;
  movements: MovementRecord[];
}

async function getMovementsData(_invoiceStatus: string): Promise<MovementSummaryResponse> {
  // Parameter is intentionally unused - the summary data is period-based, not invoice status-based
  // Agrupar por año y mes usando MonthlySummary
  const summaries = await prisma.monthlySummary.findMany({
    select: {
      year: true,
      month: true,
      debit: true,
      havings: true,
    },
  });

  // Ordenar en JavaScript
  summaries.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const movements = summaries
    .filter((s: { year: number; month: number; debit: number | null; havings: number | null }) => 
      (s.debit || 0) > 0 || (s.havings || 0) > 0
    )
    .map((s: { year: number; month: number; debit: number; havings: number }) => ({
    year: s.year,
    month: s.month,
    debit: s.debit || 0,
    havings: s.havings || 0,
    invoicesPending: 0,
  }));

  const totalDebit = movements.filter((m) => m.debit > 0 || m.havings > 0).reduce((acc: number, m: { debit: number }) => acc + m.debit, 0);
  const totalHavings = movements.reduce((acc: number, m: { havings: number }) => acc + m.havings, 0);
  
  const periodsCountSet = new Set(movements.map((m: { year: number; month: number }) => `${m.year}-${String(m.month).padStart(2, '0')}`));

  return {
    totalDebit,
    totalHavings,
    periodsCount: periodsCountSet.size,
    invoicesPending: 0,
    movements,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceStatusFromQuery = searchParams.get('invoiceStatus') || 'todos';
  const normalizedInvoiceStatus = invoiceStatusFromQuery === 'facturando' ? 'a facturar' : invoiceStatusFromQuery;

  try {
    const summary = await getMovementsData(normalizedInvoiceStatus);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error al obtener resúmenes de movimientos:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}