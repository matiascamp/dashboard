'use client'
import Table from '@/components/table'
import { useEffect, useState } from 'react'
import { FileText, Inbox } from 'lucide-react'

const columns = [
    {
        accessorKey: 'clientName',
        header: 'Cliente'
    },
    {
        accessorKey: 'date',
        header: 'Fecha de creación'
    },
    {
        accessorKey: 'pdfUrl',
        header: 'Documento'
    }
]

interface Budgets {
    clientName: string;
    date: string;
    pdfUrl: string;
}

const BudgetList = () => {
    const [budgets, setBudgets] = useState<Budgets[]>([])

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('/api/pdf/list')
                const data = await response.json()
                if (data) {
                    setBudgets(data)
                }
            } catch (error) {
                console.error('Error loading budgets:', error)
            }
        })()
    }, [])


    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)]">
            <div className="container mx-auto px-6 py-8">
                <header className="text-center mb-12 animate-fade-in">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                            <FileText className="h-8 w-8 text-[var(--primary)]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[var(--foreground)]">
                            Presupuestos Creados
                        </h1>
                    </div>
                    <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                        Historial completo de todos los presupuestos generados
                    </p>
                </header>
                {budgets.length > 0 ? (
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
                                <h3 className="text-2xl font-semibold text-[var(--foreground)]">
                                    No hay presupuestos aún
                                </h3>
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