import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

//refactor try/catch
export const GET = async () => {
    const resumen = await prisma.$queryRaw<{
        year: bigint
        month: bigint
        debit: number
        havings: number
      }>`
      SELECT
        YEAR(date) AS year,
        MONTH(date) AS month,
        SUM(CASE WHEN type = 'egreso' THEN amount ELSE 0 END) AS debit,
        SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END) AS havings
      FROM MovementDetail
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
}
