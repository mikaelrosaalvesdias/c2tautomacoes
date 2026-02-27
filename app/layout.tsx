import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Painel C2Tech",
  description: "Painel visual para suporte e automações"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
