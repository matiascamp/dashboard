import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {

    const resumen = await prisma.$queryRaw<{
      year: bigint
      month: bigint
      debit: number
      havings: number
    }[]>`
        SELECT
        EXTRACT(YEAR FROM date) AS year,
        EXTRACT(MONTH FROM date) AS month,
        SUM(CASE WHEN type = 'outcoming' THEN amount ELSE 0 END) AS debit,
        SUM(CASE WHEN type = 'incoming' THEN amount ELSE 0 END) AS havings
      FROM "MovementDetail"
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      `

    const resumenConvertido = resumen.map(item => ({
      year: Number(item.year),
      month: Number(item.month),
      debit: item.debit,
      havings: item.havings,
    }))

    return NextResponse.json(resumenConvertido)
  } catch (error) {
    console.error('Error al intentar obtener asiento contable:', error)
    return NextResponse.json({ error: ' al intentar obtener asiento contable:' }, { status: 500 })
  }
}
