import { DollarSign, FileText, TrendingUp, TrendingDown, Save } from "lucide-react";

const FormMovements = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] flex flex-col items-center justify-center p-6">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
                    Registrar 
                    <span className="text-gradient"> Movimiento</span>
                </h1>
                <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                    Agregue ingresos y egresos para mantener su contabilidad actualizada
                </p>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-md bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] animate-scale-in">
                <div className="p-6 border-b border-[var(--border)]">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Nuevo Movimiento</h2>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mt-2">
                        Complete los datos del movimiento financiero
                    </p>
                </div>

                <div className="p-6">
                    <form className="space-y-6">
                        {/* Monto */}
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
                                    "
                                />
                            </div>
                        </div>

                        {/* Descripción */}
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
                                        resize-none
                                    "
                                />
                            </div>
                        </div>

                        {/* Tipo de movimiento */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="type-movement">
                                Tipo de movimiento
                            </label>
                            <div className="relative">
                                <select
                                    id="type-movement"
                                    name="type-movement"
                                    className="
                                        w-full pl-4 pr-10 py-3 
                                        bg-[var(--input-bg)] 
                                        border border-[var(--border)]
                                        rounded-xl
                                        text-[var(--foreground)]
                                        focus:border-[var(--primary)]
                                        focus:ring-0
                                        transition-all duration-200
                                        appearance-none cursor-pointer
                                    "
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

                        {/* Botón de envío */}
                        <button
                            type="submit"
                            className="
                                w-full flex items-center justify-center space-x-2 py-3 px-4
                                bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                                text-[var(--primary-foreground)] font-semibold
                                rounded-xl
                                transition-all duration-200
                                transform hover:scale-[1.02] active:scale-[0.98]
                            "
                        >
                            <Save className="h-5 w-5" />
                            <span>Registrar Movimiento</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-md animate-fade-in">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-sm text-[var(--foreground-secondary)]">Ingresos</div>
                    <div className="text-xs text-[var(--foreground-muted)]">Entradas de dinero</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <div className="text-sm text-[var(--foreground-secondary)]">Egresos</div>
                    <div className="text-xs text-[var(--foreground-muted)]">Salidas de dinero</div>
                </div>
            </div>
        </div>
    )
}

export default FormMovements