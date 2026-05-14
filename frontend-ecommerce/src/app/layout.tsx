import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. IMPORTAMOS EL COMPONENTE TOASTER
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Misceláneas David", // Aproveché para poner el nombre real de tu tienda
  description: "La mejor ropa de invierno en Pamplona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* 2. AGREGAMOS EL TOASTER GLOBALMENTE */}
        {/* richColors: le da fondo rojo a errores y verde a éxitos */}
        {/* position="top-center": ideal para que se vea bien en móviles sin ser tapado por el teclado */}
        <Toaster position="top-center" richColors closeButton />
        
      </body>
    </html>
  );
}