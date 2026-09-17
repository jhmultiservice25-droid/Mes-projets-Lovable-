import { DashboardShell } from "@/components/DashboardShell";
import { FatshimeterConsole } from "@/components/FatshimeterConsole";
import { requirePermission } from "@/lib/auth";
import { projects } from "@/lib/demo-data";

export default async function FatshimetriePage() {
  await requirePermission("projects:view");
  const knownBudget = projects.reduce((sum, project) => sum + (project.budgetCdf || 0), 0);
  const sourced = projects.filter((project) => project.verified).length;
  const measured = projects.filter((project) => project.physical != null || project.financial != null).length;
  return (
    <DashboardShell title="Fatshimétrie locale" subtitle="Projets publics identifiés à Kasa-Vubu : programmation, preuves, financement et exécution">
      <div className="compliance-banner"><div><span className="banner-icon">▥</span><div><strong>Suivi fondé sur la preuve</strong><p>La plateforme sépare la programmation budgétaire, l'existence du chantier et la mesure de son avancement. Aucun pourcentage n'est inventé.</p></div></div><span className="evidence-badge verified">Référentiel sourcé</span></div>
      <div className="metrics-grid compact">
        <Metric label="Portefeuille suivi" value={`${projects.length} projets`} note="Kasa-Vubu" />
        <Metric label="Budget public identifié" value={`${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(knownBudget / 1_000_000_000)} Md CDF`} note="montants publiés uniquement" />
        <Metric label="Fiches sourcées" value={`${sourced} / ${projects.length}`} note="sources publiques identifiées" />
        <Metric label="Avancement mesuré" value={`${measured} / ${projects.length}`} note="preuves quantitatives requises" />
      </div>
      <FatshimeterConsole />
    </DashboardShell>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric-card"><div className="metric-head"><span>{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-meta">{note}</span></article>;
}
