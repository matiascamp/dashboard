import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    
    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        // No incluir passwordHash por seguridad
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error en /api/me:", error);
    if (error instanceof jwt.TokenExpiredError) {
      // Limpiar cookie expirada
      const response = NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
      response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/'
      });
      return response;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}