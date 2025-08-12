import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const budgets = await prisma.budgets.findMany({
      orderBy: {
        createdDate: 'desc',
      },
    })
    console.log("budgets",budgets);
    
    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Error fetching budgets' }, { status: 500 })
  }
}
