import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portail public — Commune de Kasa-Vubu | e-Commune RDC",
  description: "Présentation de la commune de Kasa-Vubu, autorités, quartiers, services communaux, actualités et orientation des démarches citoyennes.",
  robots: { index: true, follow: true },
};

export default function PublicPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
