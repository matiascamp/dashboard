'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    (async () => {
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
      }
    })()
  }, [])

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/pdf/generatePdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json()

      if (!data.url) return

      await fetch('/api/pdf/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdDate: new Date(),
          clientName: formData.client,
          pdfUrl: data.url
        })
      })

      window.open(data.url);

    } catch (error) {
      console.error('Error al generar pdf:', error);
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
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          <div className="w-full flex-1">
            <PdfForm
              formData={formData}
              setFormData={setFormData}
              onDownload={handleDownload}
              isGenerating={isGenerating}
            />
          </div>
          <div className="flex-1">
            <PdfPreview 
              formData={formData} 
              setFormData={setFormData} 
            />
          </div>
          {/* <Viewer formData={formData} /> */}
        </div>
      </div>
    </div>
  );
}