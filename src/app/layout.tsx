import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediAgenda Colombia - Citas Médicas",
  description: "Sistema inteligente para gestión de citas médicas en Colombia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white min-h-screen`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}