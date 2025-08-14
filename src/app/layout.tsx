import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import NavBar from "@/components/navBar";

import { AuthProvider } from "@/context/authProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dashboard | Herrería del Plata",
  description: "Sistema de gestión administrativo moderno y eficiente",
  keywords: ["dashboard", "herrería", "gestión", "presupuestos", "administración"],
  authors: [{ name: "Herrería del Plata" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="h-full"
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className={`
          ${inter.variable} 
          font-sans 
          antialiased 
          h-full
          bg-[var(--background)]
          text-[var(--foreground)]
          transition-colors
          duration-300
        `}
      >
        <AuthProvider>
          <NavBar>
            {children}
          </NavBar>
        </AuthProvider>
      </body>
    </html>
  );
}