import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_CDN_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

function objectKeyFromPdfUrl(url: string): string | null {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean)
    return segments.length ? segments[segments.length - 1]! : null
  } catch {
    return null
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const budgetId = Number(id)
    if (!budgetId) {
      return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
    }

    const budget = await prisma.budgets.findUnique({
      where: { id: budgetId },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    const key = objectKeyFromPdfUrl(budget.pdfUrl)
    const bucket = process.env.R2_BUCKET_NAME

    if (key && bucket && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        )
      } catch (err) {
        console.error('Error al eliminar el archivo del almacenamiento', err)
      }
    }

    await prisma.budgets.delete({
      where: { id: budgetId },
    })

    return NextResponse.json({ message: 'Presupuesto eliminado' })
  } catch (error) {
    console.error('Error al eliminar presupuesto', error)
    return NextResponse.json({ error: 'Error al eliminar presupuesto' }, { status: 500 })
  }
}
