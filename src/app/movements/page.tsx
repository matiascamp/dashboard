'use client'
import { useEffect, useState } from "react"
import Table from "../../components/table"
import { Calculator, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"

const columns = [
  {
    accessorKey: 'debit',
    header: 'Debe'
  },
  {
    accessorKey: 'havings',
    header: 'Haber'
  },
  {
    accessorKey: 'monthYear',
    header: 'Período'
  },
  {
    accessorKey: 'detail',
    header: 'Acciones'
  }
]

type Summary = {
  year: number
  month: number
  debit: number
  havings: number
}

const AccountingEntry = () => {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalHavings: 0,
    periodsCount: 0
  })

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/summaries')
        const data = await response.json()
        setSummaries(data)
      } catch (error) {
        console.error('Error loading summaries:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!summaries.length) return
    
    const totalAmount = summaries.reduce(
      (acc, curr) => acc - curr.debit + curr.havings,
      0
    )
    setTotal(totalAmount)

    // Calculate stats
    const totalDebit = summaries.reduce((acc, curr) => acc + curr.debit, 0)
    const totalHavings = summaries.reduce((acc, curr) => acc + curr.havings, 0)
    
    setStats({
      totalDebit,
      totalHavings,
      periodsCount: summaries.length
    })
  }, [summaries])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
          <p className="text-[var(--foreground-secondary)]">Cargando asientos contables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)]">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
              <Calculator className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--foreground)]">
              Asientos Contables
            </h1>
          </div>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Resumen mensual de movimientos contables con balance general
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8 animate-scale-in">
          {/* Total Periods */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Períodos</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stats.periodsCount}</p>
              </div>
            </div>
          </div>

          {/* Total Debit */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Total Debe</p>
                <p className="text-2xl font-bold text-red-500">${stats.totalDebit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Total Havings */}
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Total Haber</p>
                <p className="text-2xl font-bold text-green-500">${stats.totalHavings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className={`bg-[var(--card-bg)] border-2 rounded-2xl p-6 shadow-[var(--shadow-md)] ${
            total >= 0 
              ? 'border-green-500/30 bg-green-500/5' 
              : 'border-red-500/30 bg-red-500/5'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                total >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <DollarSign className={`h-6 w-6 ${
                  total >= 0 ? 'text-green-500' : 'text-red-500'
                }`} />
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Balance Final</p>
                <p className={`text-2xl font-bold ${
                  total >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  ${total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="animate-fade-in">
          <Table columns={columns} data={summaries} total={total} />
        </div>
      </div>
    </div>
  )
}

export default AccountingEntry