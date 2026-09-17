import { DashboardShell } from "@/components/DashboardShell";
import { ParcelImportConsole } from "@/components/ParcelImportConsole";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function ParcellesPage() {
  const session = await requirePermission("urbanism:view");
  const canWrite = hasPermission(session.role, "urbanism:write");
  return <DashboardShell title="Parcelles & domaine communal" subtitle="Référentiel foncier PostgreSQL, géométries GeoJSON, provenance et validation administrative">
    <div className="compliance-banner"><div><span className="banner-icon">⌗</span><div><strong>Cadastre sans donnée fictive</strong><p>Le module conserve les géométries, la provenance et l'auteur de la saisie sans transformer une numérisation en preuve de propriété.</p></div></div><span className="evidence-badge verified">Audit PostgreSQL</span></div>
    <div className="metrics-grid compact"><Mini label="Persistance" value="PostgreSQL" note="multi-agents"/><Mini label="Géométrie" value="GeoJSON" note="Polygon / MultiPolygon"/><Mini label="Provenance" value="Obligatoire" note="source conservée"/><Mini label="Accès écriture" value={canWrite ? "Oui" : "Non"} note="selon rôle"/></div>
    <ParcelImportConsole canWrite={canWrite}/>
  </DashboardShell>;
}

function Mini({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric-card"><div className="metric-head"><span>{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-meta">{note}</span></article>;
}
