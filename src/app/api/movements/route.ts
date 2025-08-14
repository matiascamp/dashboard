import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { name, description, amount, type } = await req.json();

    if (!name || !description || !amount || !type) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

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
        amount,
        type,
        date,
        monthlySummaryId: summary.id
      }
    });

    await prisma.monthlySummary.update({
      where: { id: summary.id },
      data: {
        debit: type === "outcoming" ? { increment: amount } : undefined,
        havings: type === "incoming" ? { increment: amount } : undefined
      }
    });

    return NextResponse.json({ message: "Movimiento creado", movement });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear movimiento" }, { status: 500 });
  }
};
