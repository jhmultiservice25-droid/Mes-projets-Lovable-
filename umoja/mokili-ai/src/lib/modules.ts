import { GraduationCap, HeartPulse, Landmark, Wallet, Accessibility } from "lucide-react";

export const MODULES = [
  { key: "education", to: "/app/education" as const, name: "MOKILI ÉDUCATION", short: "Éducation", icon: GraduationCap, tagline: "Un tuteur qui explique, corrige et fait réviser." },
  { key: "sante", to: "/app/sante" as const, name: "MOKILI SANTÉ", short: "Santé", icon: HeartPulse, tagline: "Informer, prévenir, orienter — jamais diagnostiquer." },
  { key: "finance", to: "/app/finance" as const, name: "MOKILI FINANCE", short: "Finance", icon: Wallet, tagline: "Le carnet de ventes et dépenses du commerçant." },
  { key: "admin", to: "/app/admin" as const, name: "MOKILI ADMIN", short: "Admin", icon: Landmark, tagline: "Comprendre une démarche et un document officiel." },
  { key: "inclusion", to: "/app/inclusion" as const, name: "MOKILI INCLUSION", short: "Inclusion", icon: Accessibility, tagline: "Langues nationales, voix, mode simplifié, hors-ligne." },
] as const;

export type ModuleDef = (typeof MODULES)[number];