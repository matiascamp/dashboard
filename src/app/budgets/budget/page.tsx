'use client';

import { useState } from 'react';
import PdfForm from '@/components/pdf/form';
import PdfPreview from '@/components/pdf/pdfpreview';

interface FormData {
  client: string;
  text: string;
  materialPrice: number ;
  inputs: number ;
  labor: number
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    client: '',
    text: '',
    materialPrice: 0,
    inputs: 0,
    labor: 0
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generatePdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documento.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Generador de PDF</h1>
      <div className="max-w-7xl mx-auto flex h-auto gap-7">
        <PdfForm
          formData={formData}
          setFormData={setFormData}
          onDownload={handleDownload}
          isGenerating={isGenerating}
        />
        <PdfPreview formData={formData} />
      </div>
    </main>
  );
}