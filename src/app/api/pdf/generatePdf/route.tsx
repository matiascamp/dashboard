import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import PdfDocument, { PDFFormData } from '@/components/pdf/pdf';
import { Readable } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';



const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_CDN_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toBufferFromStream = async (stream:any): Promise<Buffer> => {
  
  if (stream instanceof Readable) {

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } else if ('getReader' in stream && typeof stream.getReader === 'function') {

    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } else {
    throw new Error('Tipo de stream desconocido');
  }
}

// Función para convertir imagen a base64
const imageToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al cargar imagen: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error convirtiendo imagen ${url}:`, error);
    throw error;
  }
}


export const POST = async (request: NextRequest) => {
  try {
    const formData: PDFFormData = await request.json();

    // Usar URLs completas con protocolo para las imágenes estáticas
    const baseUrl = process.env.BASE_URL?.startsWith('http') 
      ? process.env.BASE_URL 
      : `https://${process.env.BASE_URL}`;
    
    const imageUrls = {
      logo: `${baseUrl}/logo.jpg`,
      igIcon: `${baseUrl}/instagram_icon.png`,
      phoneIcon: `${baseUrl}/phone_icon.png`,
      facebookIcon: `${baseUrl}/facebook_icon.png`,
    };

    // Convertir todas las imágenes a base64
    const images = {
      logo: await imageToBase64(imageUrls.logo),
      igIcon: await imageToBase64(imageUrls.igIcon),
      phoneIcon: await imageToBase64(imageUrls.phoneIcon),
      facebookIcon: await imageToBase64(imageUrls.facebookIcon),
    };

    const pdfStream = await pdf(<PdfDocument formData={formData} images={images} />).toBuffer();
    const pdfBuffer = await toBufferFromStream(pdfStream);
    
  
    const fileName = `${Date.now()}.pdf`;

    await s3.send(new PutObjectCommand({
      Bucket:process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    }))

    const workerUrl = `${process.env.WORKER_BASE_URL}/${fileName}`;

    return NextResponse.json({
      url: workerUrl,
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}
