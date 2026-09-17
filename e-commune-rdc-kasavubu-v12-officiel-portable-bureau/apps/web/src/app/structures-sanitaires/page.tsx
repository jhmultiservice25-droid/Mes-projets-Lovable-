import { DashboardShell } from "@/components/DashboardShell";
import { HealthFacilitiesConsole } from "@/components/HealthFacilitiesConsole";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { healthFacilities, kasaVubuQuartiers } from "@/lib/pilot-data";

export default async function StructuresSanitairesPage() {
  const session = await requirePermission("health:view");
  const canWrite = hasPermission(session.role, "health:write");
  const geolocated = healthFacilities.filter((facility) => facility.lat != null && facility.lon != null).length;
  const communal = healthFacilities.filter((facility) => facility.origin === "Créée par la commune").length;

  return (
    <DashboardShell title="Structures sanitaires" subtitle="Registre communal, couverture de proximité, projets et conformité sanitaire">
      <div className="compliance-banner health-banner"><div><span className="banner-icon">✚</span><div><strong>Registre sanitaire de Kasa-Vubu</strong><p>Les structures existantes sont séparées des structures créées ou financées par la commune. Le registre pilote n'est pas présenté comme une liste exhaustive de la Zone de santé.</p></div></div><span className="evidence-badge">Pilote Kasa-Vubu</span></div>

      <div className="metrics-grid compact">
        <Mini label="Structures référencées" value={String(healthFacilities.length)} note="socle pilote à consolider" />
        <Mini label="Créées par la commune" value={String(communal)} note="aucune donnée inventée" />
        <Mini label="Points géolocalisés" value={`${geolocated}/${healthFacilities.length}`} note="coordonnées documentées" />
        <Mini label="Quartiers" value={String(kasaVubuQuartiers.length)} note="référentiel communal" />
      </div>

      <section className="panel health-governance">
        <div><strong>Compétence de proximité</strong><p>Le système couvre secours/premiers soins, hygiène, vaccination, lutte contre les maladies endémiques et suivi des établissements/services communaux, tout en conservant les références d'autorisation sanitaire requises.</p></div>
        <div><strong>Lien Fatshimétrie</strong><p>Une construction ou réhabilitation financée sur fonds publics peut être rattachée à un projet, son budget, ses décaissements, ses jalons et ses preuves.</p></div>
        <div><strong>Carte sanitaire</strong><p>Chaque structure peut être rattachée à un quartier, une adresse et des coordonnées pour analyser la couverture territoriale de Kasa-Vubu.</p></div>
      </section>

      <HealthFacilitiesConsole canWrite={canWrite} />
    </DashboardShell>
  );
}

function Mini({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric-card"><div className="metric-head"><span>{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-meta">{note}</span></article>;
}
