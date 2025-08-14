import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const year = Number(searchParams.get('year'))
  const month = Number(searchParams.get('month'))
  
  if (!year || !month) {
    return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
  }
  
  const detalles = await prisma.movementDetail.findMany({
    where: {
      date: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
    select: {
      amount: true,
      description: true,
      date: true,
      name: true,
    },
  })
  
  return NextResponse.json(detalles)
}
