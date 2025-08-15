import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export async function POST(req: Request) {
  try {

    const { email, password } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    const res = NextResponse.json({ token: accessToken });
    res.cookies.set("token", accessToken, { httpOnly: true, path: "/", maxAge: 15 * 60 });
    res.cookies.set("refreshToken", refreshToken, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60 });

    return res;
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}