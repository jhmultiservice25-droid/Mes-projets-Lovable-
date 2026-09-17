import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e‑Commune RDC — Kasa-Vubu",
  description: "Pilote interne de gouvernance et de gestion de la Commune de Kasa-Vubu",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
