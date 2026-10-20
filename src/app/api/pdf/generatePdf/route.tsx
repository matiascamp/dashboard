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


export const POST = async (request: NextRequest) => {
  try {
    const requestFormData = await request.formData();
    const payload = requestFormData.get('payload');
    if (typeof payload !== 'string') {
      return NextResponse.json({ error: 'Faltan los datos del presupuesto' }, { status: 400 });
    }

    let formData: PDFFormData;
    try {
      formData = JSON.parse(payload) as PDFFormData;
    } catch {
      return NextResponse.json({ error: 'Los datos del presupuesto no son válidos' }, { status: 400 });
    }

    const uploadedImages = requestFormData.getAll('images');
    if (uploadedImages.length > 6) {
      return NextResponse.json({ error: 'Podés agregar hasta 6 imágenes.' }, { status: 400 });
    }

    const attachments: string[] = [];
    for (const entry of uploadedImages) {
      if (typeof entry === 'string' || entry.type !== 'image/jpeg' || entry.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Las imágenes deben estar comprimidas en JPG y pesar hasta 5 MB cada una.' },
          { status: 400 },
        );
      }

      const imageBuffer = Buffer.from(await entry.arrayBuffer());
      if (imageBuffer.length < 3 || imageBuffer[0] !== 0xff || imageBuffer[1] !== 0xd8 || imageBuffer[2] !== 0xff) {
        return NextResponse.json({ error: 'Una de las imágenes JPG no es válida.' }, { status: 400 });
      }
      attachments.push(`data:image/jpeg;base64,${imageBuffer.toString('base64')}`);
    }

    const assetBaseUrl = request.nextUrl.origin.replace(/\/$/, '');
    const images = {
      logo: `${assetBaseUrl}/logo.jpg`,
      igIcon: `${assetBaseUrl}/instagram_icon.png`,
      phoneIcon: `${assetBaseUrl}/phone_icon.png`,
      facebookIcon: `${assetBaseUrl}/facebook_icon.png`,
    };

    const pdfStream = await pdf(<PdfDocument formData={formData} images={images} attachments={attachments} />).toBuffer();
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
