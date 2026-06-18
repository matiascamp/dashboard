import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const recalculateSummaryTotals = async (summaryId: number) => {
  const summaryDetails = await prisma.movementDetail.findMany({
    where: { monthlySummaryId: summaryId },
    select: { amount: true, type: true },
  })

  const debit = summaryDetails.reduce((acc, item) => {
    return item.type === 'outcoming' ? acc + item.amount : acc
  }, 0)

  const havings = summaryDetails.reduce((acc, item) => {
    return item.type === 'incoming' ? acc + item.amount : acc
  }, 0)

  await prisma.monthlySummary.update({
    where: { id: summaryId },
    data: { debit, havings },
  })
}

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const movementId = Number(id)
    const body = await req.json()
    const { name, description, type, amount, dollarRate, amountOriginal, invoice } = body

    if (!movementId || !name || !description || !type) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const currentMovement = await prisma.movementDetail.findUnique({
      where: { id: movementId },
      select: {
        id: true,
        monthlySummaryId: true,
        currency: true,
        amountOriginal: true,
        dollarRate: true,
      },
    })

    if (!currentMovement) {
      return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
    }

    const isUsd = currentMovement.currency === 'USD'
    let amountArs = Number(amount)

    if (isUsd) {
      const usd = Number(amountOriginal)
      const rate = Number(dollarRate)
      if (!usd || usd <= 0 || !rate || rate <= 0) {
        return NextResponse.json(
          { error: 'Para movimientos en USD, el monto en dólares y la cotización deben ser mayores a 0' },
          { status: 400 }
        )
      }
      amountArs = usd * rate
    } else {
      if (amount == null || Number(amount) <= 0) {
        return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
      }
      amountArs = Number(amount)
    }

    const updatedMovement = await prisma.movementDetail.update({
      where: { id: movementId },
      data: {
        name,
        description,
        amount: amountArs,
        type,
        ...(isUsd && {
          dollarRate: Number(dollarRate),
          amountOriginal: Number(amountOriginal),
        }),
        ...(invoice !== undefined && { invoice }),
      },
    })

    await recalculateSummaryTotals(currentMovement.monthlySummaryId)

    return NextResponse.json({ message: 'Movimiento actualizado', movement: updatedMovement })
  } catch (error) {
    console.error('Error al actualizar movimiento', error)
    return NextResponse.json({ error: 'Error al actualizar movimiento' }, { status: 500 })
  }
}

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const movementId = Number(id)
    if (!movementId) {
      return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
    }

    const movement = await prisma.movementDetail.findUnique({
      where: { id: movementId },
      select: { id: true, monthlySummaryId: true },
    })

    if (!movement) {
      return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
    }

    await prisma.movementDetail.delete({
      where: { id: movementId },
    })

    await recalculateSummaryTotals(movement.monthlySummaryId)

    return NextResponse.json({ message: 'Movimiento eliminado' })
  } catch (error) {
    console.error('Error al eliminar movimiento', error)
    return NextResponse.json({ error: 'Error al eliminar movimiento' }, { status: 500 })
  }
}
