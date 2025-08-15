import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import PdfDocument, { PDFFormData } from '@/components/pdf/pdf';
import { Readable } from 'stream';
import path from 'path'
import fs from 'fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const toBase64 = (filePath: string, mime: string) => {
  const absPath = path.resolve(process.cwd(), filePath);
  const buffer = fs.readFileSync(absPath);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

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


export const POST = async (request: NextRequest) => {
  try {
    const formData: PDFFormData = await request.json();

    const images = {
      logo: toBase64('src/assets/logo.jpg', 'image/jpeg'),
      igIcon: toBase64('src/assets/instagram_icon.png', 'image/png'),
      phoneIcon: toBase64('src/assets/phone_icon.png', 'image/png'),
      facebookIcon: toBase64('src/assets/facebook_icon.png', 'image/png'),
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
