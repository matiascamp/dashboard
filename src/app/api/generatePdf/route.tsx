import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import PdfDocument, { PDFFormData } from '@/components/pdf/pdf';
import React from 'react';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const formData: PDFFormData = await request.json();

    // pdf().toBuffer() en Node puede ser directamente un Buffer
    const result = await pdf(<PdfDocument formData={formData} />).toBuffer();

    // Si ya es Buffer o Uint8Array, lo mandamos directo
    if (result instanceof Buffer || result instanceof Uint8Array) {
      return new NextResponse(result, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="documento.pdf"',
        },
      });
    }

    // Si es Readable Stream de Node, convertirlo a Buffer
    if (result instanceof Readable) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of result) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="documento.pdf"',
        },
      });
    }

    throw new Error('Formato de salida de PDF no soportado');
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}
