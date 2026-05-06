import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consigo – Gestão de Consignados",
  description: "Plataforma SaaS completa para gestão de mercadorias consignadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
