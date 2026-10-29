import { DashboardShell } from "@/components/DashboardShell";
import { DossiersPublicsConsole } from "./DossiersPublicsConsole";
import { requirePermission } from "@/lib/auth";

export default async function DossiersPublicsPage() {
  await requirePermission("complaints:view");
  return <DashboardShell title="Dossiers citoyens" subtitle="Réception, suivi et traitement des demandes publiques"><DossiersPublicsConsole /></DashboardShell>;
}
