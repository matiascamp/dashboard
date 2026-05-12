import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { name, description, amount, type, currency, dollarRate } = await req.json();

    if (!name || !description || !amount || !type || !currency) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (currency === "USD" && (!dollarRate || Number(dollarRate) <= 0)) {
      return NextResponse.json({ error: "Falta cotización del dólar" }, { status: 400 });
    }

    const amountNumber = Number(amount);
    const dollarRateNumber = dollarRate ? Number(dollarRate) : 1;
    const amountInArs = currency === "USD"
      ? amountNumber * dollarRateNumber
      : amountNumber;

    const date = new Date();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();

    let summary = await prisma.monthlySummary.findFirst({
      where: { month, year }
    });

    if (!summary) {
      summary = await prisma.monthlySummary.create({
        data: {
          month,
          year,
          debit: 0,
          havings: 0
        }
      });
    }

    const movement = await prisma.movementDetail.create({
      data: {
        name,
        description,
        amount: amountInArs,
        type,
        date,
        monthlySummaryId: summary.id,
        currency,
        dollarRate: currency === "USD" ? dollarRateNumber : null,
        amountOriginal: currency === "USD" ? amountNumber : null,
      }
    });

    await prisma.monthlySummary.update({
      where: { id: summary.id },
      data: {
        debit: type === "outcoming" ? { increment: amountInArs } : undefined,
        havings: type === "incoming" ? { increment: amountInArs } : undefined
      }
    });

    return NextResponse.json({
      message: "Movimiento creado",
      movement,
      conversion: {
        currency,
        dollarRate: currency === "USD" ? dollarRateNumber : null,
        amountOriginal: amountNumber,
        amountInArs,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear movimiento" }, { status: 500 });
  }
};
