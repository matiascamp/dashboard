'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { PageBlockLoader } from '@/components/page-block-loader';
import PdfForm from '@/components/pdf/form';
import PdfPreview from '@/components/pdf/pdfpreview';
// import Viewer from '@/components/pdf/viewer';

interface FormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  labor: number;
  total?: number;
}

export default function BudgetPage() {
  const [formData, setFormData] = useState<FormData>({
    budgetId: null,
    client: '',
    text: '',
    materialPrice: 0,
    labor: 0,
    total: 0
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      setIsBootstrapping(true)
      try {
        const response = await fetch('/api/pdf/list')
        const data = await response.json()
        if (!data) return

        setFormData(prev => ({
          ...prev,
          budgetId: data.length === 0 ? 1 : data.length + 1
        }))

      } catch (error) {
        console.error("error al obtener listado de pdf", error)
      } finally {
        setIsBootstrapping(false)
      }
    })()
  }, [])

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const issueDate = new Date().toISOString()

      const response = await fetch('/api/pdf/generatePdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, issueDate })
      });

      const data = await response.json()

      if (!response.ok) {
        toast.error(typeof data?.error === 'string' ? data.error : 'Error al generar el PDF')
        return
      }

      if (!data.url) {
        toast.error('No se recibió la URL del documento')
        return
      }

      const createRes = await fetch('/api/pdf/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdDate: issueDate,
          clientName: formData.client,
          pdfUrl: data.url
        })
      })

      const createData = await createRes.json().catch(() => ({}))

      if (!createRes.ok) {
        toast.error(
          typeof createData?.error === 'string' ? createData.error : 'No se pudo guardar el presupuesto'
        )
        return
      }

      toast.success('Presupuesto creado', {
        description: 'El archivo se generó y quedó guardado en el historial.',
      })
      window.open(data.url);
    } catch (error) {
      console.error('Error al generar pdf:', error);
      toast.error('Ocurrió un error al generar o guardar el presupuesto')
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)]">
      <div className="container mx-auto px-6 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            Crear Presupuesto
          </h1>
        </header>
        <div className="relative flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {isBootstrapping && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[var(--background)]/80 backdrop-blur-sm">
              <PageBlockLoader label="Preparando formulario..." />
            </div>
          )}
          <div className={`w-full flex-1 ${isBootstrapping ? 'pointer-events-none opacity-40' : ''}`}>
            <PdfForm
              formData={formData}
              setFormData={setFormData}
              onDownload={handleDownload}
              isGenerating={isGenerating}
            />
          </div>
          <div className={`relative flex-1 ${isBootstrapping ? 'pointer-events-none opacity-40' : ''}`}>
            <div className={isGenerating && !isBootstrapping ? 'pointer-events-none opacity-50 transition-opacity' : ''}>
              <PdfPreview
                formData={formData}
                setFormData={setFormData}
              />
            </div>
            {isGenerating && !isBootstrapping && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--background)]/50">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-5 py-4 shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" aria-hidden />
                  <span className="text-sm font-medium text-[var(--foreground-secondary)]">Generando PDF...</span>
                </div>
              </div>
            )}
          </div>
          {/* <Viewer formData={formData} /> */}
        </div>
      </div>
    </div>
  );
}