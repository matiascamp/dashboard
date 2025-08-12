'use client';

import { useEffect, useState } from 'react';
import PdfForm from '@/components/pdf/form';
import PdfPreview from '@/components/pdf/pdfpreview';


interface FormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
  labor: number;
  total?: number
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    budgetId: null,
    client: '',
    text: '',
    materialPrice: 0,
    inputs: 0,
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
  
        console.log("data length", data.length)
        setFormData(prev => ({
          ...prev,
          budgetId: data.length === 0 ? 1 : data.length + 1
        }))
  
        console.log("Dat", data)
      } catch (error) {
        console.log("error", error)
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

      const createdResponse = await fetch('/api/pdf/create',{
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdDate: new Date(),
          clientName:formData.client,
          pdfUrl: data.url
        })
      })
      const parsedResponse = await createdResponse.json()

      console.log("parsedResponse",parsedResponse);
      

      window.open(data.url, '_blank');

    } catch (error) {
      console.error('Error al generar pdf:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Generador de presupuesto</h1>
      <div className=" mx-auto flex h-auto gap-7">
        <PdfForm
          formData={formData}
          setFormData={setFormData}
          onDownload={handleDownload}
          isGenerating={isGenerating}
        />
        <PdfPreview formData={formData} setFormData={setFormData} />
      </div>
    </main>
  );
}