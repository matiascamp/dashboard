'use client'
import { movementSchema } from "@/schemas/movementSchem";
import { DollarSign, FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";

const FormMovements = () => {

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        description: '',
        type: 'incoming'
    })

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const result = movementSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const field = issue.path[0] as string;
                newErrors[field] = issue.message;
            });
            setErrors(newErrors);
        } else {
            setErrors({});
        }
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const result = movementSchema.safeParse(formData);
        if (!result.success) return
        try {
            const res = await fetch('/api/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    date: new Date()
                })
            })

            if (!res.ok) throw new Error('Error al crear movimiento')
            alert('Registrado correctamente')
            setFormData({
                name: '',
                amount: '0',
                description: '',
                type: 'incoming'
            })
        } catch (error) {
            console.error('Error al intentar registrar movimiento', error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] flex flex-col items-center justify-center p-6">
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
                    Registrar
                    <span className="text-gradient"> Movimiento</span>
                </h1>
            </div>
            <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] animate-scale-in">
                <div className="p-6 border-b border-[var(--border)]">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Nuevo Movimiento</h2>
                    </div>
                </div>
                <div className="p-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="name">
                                Nombre de operacion
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Ingrese nombre de operacion..."
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                    className="
                                        w-full pl-10 pr-4 py-3 
                                        bg-[var(--input-bg)] 
                                        border border-[var(--border)]
                                        rounded-xl
                                        text-[var(--foreground)]
                                        placeholder:text-[var(--foreground-muted)]
                                        focus:border-[var(--primary)]
                                        focus:ring-0
                                        transition-all duration-200"
                                />
                                {errors.name && <p className="absolute text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="amount">
                                Monto
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        amount: e.target.value
                                    }))}
                                    className="
                                        w-full pl-10 pr-4 py-3 
                                        bg-[var(--input-bg)] 
                                        border border-[var(--border)]
                                        rounded-xl
                                        text-[var(--foreground)]
                                        placeholder:text-[var(--foreground-muted)]
                                        focus:border-[var(--primary)]
                                        focus:ring-0
                                        transition-all duration-200"
                                />
                                {errors.amount && <p className="absolute text-red-500 text-sm mt-1">{errors.amount}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="description">
                                Descripción
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-5 w-5 text-[var(--foreground-muted)]" />
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Detalles del movimiento..."
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    className="
                                        w-full pl-10 pr-4 py-3 
                                        bg-[var(--input-bg)] 
                                        border border-[var(--border)]
                                        rounded-xl
                                        text-[var(--foreground)]
                                        placeholder:text-[var(--foreground-muted)]
                                        focus:border-[var(--primary)]
                                        focus:ring-0
                                        transition-all duration-200
                                        resize-none"
                                />
                                {errors.description && <p className="absolute text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="type-movement">
                                Tipo de movimiento
                            </label>
                            <div className="relative">
                                <select
                                    id="type-movement"
                                    name="type-movement"
                                    value={formData.type}
                                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as "incoming" | "outcoming" }))}
                                    className="
                                        w-full pl-4 pr-10 py-3 
                                        bg-[var(--input-bg)] 
                                        border border-[var(--border)]
                                        rounded-xl
                                        text-[var(--foreground)]
                                        focus:border-[var(--primary)]
                                        focus:ring-0
                                        transition-all duration-200
                                        appearance-none cursor-pointer"
                                >
                                    <option value="incoming">💰 Ingreso</option>
                                    <option value="outcoming">💸 Egreso</option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={Object.keys(errors).length > 0}
                            className="
                                w-full flex items-center justify-center space-x-2 py-3 px-4
                                bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                                text-[var(--primary-foreground)] font-semibold
                                rounded-xl
                                transition-all duration-200
                                transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Save className="h-5 w-5" />
                            <span>Registrar Movimiento</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default FormMovements