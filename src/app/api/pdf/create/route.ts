import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { createdDate, clientName, pdfUrl } = body

        if (!createdDate || !clientName || !pdfUrl) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios: date y clientName' },
                { status: 400 }
            )
        }

        const newBudget = await prisma.budgets.create({
            data: {
                createdDate,
                clientName,
                pdfUrl
            },
        })

        return NextResponse.json(newBudget, { status: 201 })
    } catch (error) {
        console.error('Error creating budget:', error)
        return NextResponse.json({ error: 'Error creando presupuesto' }, { status: 500 })
    }
}
