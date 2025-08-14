import Image from "next/image";
import { useEffect } from "react";
import { Eye, Calendar, Hash, User } from "lucide-react";

interface FormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
  labor: number;
  total?: number;
}

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function PdfPreview({ formData, setFormData }: Props) {
  const total = +formData.materialPrice + +formData.inputs + +formData.labor;

  useEffect(() => {
    setFormData({
      ...formData,
      total
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.materialPrice, formData.inputs, formData.labor]);

  return (
    <div className="w-full max-w-2xl bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] animate-scale-in">
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <Eye className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Vista Previa</h2>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] mt-2">
          Previsualización del PDF que se generará
        </p>
      </div>

      <div className="p-6">
        {/* PDF Container */}
        <div className="w-full max-w-[595px] mx-auto bg-white shadow-[var(--shadow-lg)] rounded-lg overflow-hidden">
          {/* PDF Content */}
          <div className="p-8 text-black space-y-8">
            {/* Header */}
            <header className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Image 
                    src="/logo.jpg" 
                    alt="Herrería del Plata" 
                    width={100} 
                    height={100}
                    className="rounded-lg shadow-md"
                  />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">PRESUPUESTO</h1>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Nº:</span>
                      <span className="text-gray-700">{formData.budgetId || '---'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Fecha:</span>
                      <span className="text-gray-700">{new Date().toLocaleDateString("es-ES")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Cliente:</span>
                      <span className="text-gray-700">{formData.client || 'Sin especificar'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Descripción */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Descripción del Trabajo
              </h3>
              <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {formData.text || 'No hay descripción disponible...'}
                </p>
              </div>
            </section>

            {/* Desglose de costos */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Desglose de Costos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Precio de materiales:</span>
                  <span className="text-gray-900">${formData.materialPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Insumos:</span>
                  <span className="text-gray-900">${formData.inputs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Mano de obra:</span>
                  <span className="text-gray-900">${formData.labor.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">TOTAL:</span>
                  <span className="text-2xl font-bold">${total.toLocaleString()}</span>
                </div>
              </div>
            </section>

            {/* Footer con datos de contacto */}
            <footer className="pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-2">
                <h4 className="font-semibold text-gray-700 mb-3">Información de Contacto</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <Image src="/ig_icon.svg" alt="Instagram" width={16} height={16} className="opacity-70" />
                    <span>@herreriadelplata</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image src="/phone_icon.svg" alt="Teléfono" width={16} height={16} className="opacity-70" />
                    <span>Contacto telefónico disponible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image src="/facebook_icon.svg" alt="Facebook" width={16} height={16} className="opacity-70" />
                    <span>Herreria_del_plata</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}