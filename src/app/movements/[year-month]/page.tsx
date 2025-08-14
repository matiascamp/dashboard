'use client'
import React from 'react'
import Table from '../../../components/table'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FileSearch, Calendar, DollarSign, FileText } from 'lucide-react'

const columns = [
  {
    accessorKey: 'name',
    header: 'Concepto'
  },
  {
    accessorKey: 'description',
    header: 'Descripción'
  },
  {
    accessorKey: 'amount',
    header: 'Monto'
  },
  {
    accessorKey: 'date',
    header: 'Fecha'
  }
]

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

  const [details, setDetails] = useState([])

  const [periodInfo, setPeriodInfo] = useState({ year: '', month: '' })

  useEffect(() => {
    (async () => {
      try {
        if (!yearMonth) return

        const [year, month] = String(yearMonth).split('-')
        setPeriodInfo({ year, month })
        const res = await fetch(`/api/details?year=${year}&month=${month}`)
        const data = await res.json()
        setDetails(data)
      } catch (error) {
        console.error('Error loading details:', error)
      }
    })()
  }, [yearMonth])


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
        {details.length > 0 ? (
          <div className="animate-fade-in">
            <Table columns={columns} data={details} />
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
    </div>
  )
}

export default MovementsDetails