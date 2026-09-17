import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { requirePermission } from "@/lib/auth";
import { kasaVubuPilot, kasaVubuQuartiers } from "@/lib/pilot-data";
import { kasaVubuStreets, territorialAssets, territorySources, totalPilotStreets } from "@/lib/territory-data";

export default async function TerritoirePage() {
  await requirePermission("map:view");
  const officialAssets = territorialAssets.filter((asset) => asset.validation === "OFFICIEL" || asset.validation === "SECTORIEL").length;

  return (
    <DashboardShell title="Territoire & équipements — Kasa-Vubu" subtitle="Quartiers, avenues, équipements publics et provenance des données">
      <div className="territory-hero panel">
        <div>
          <span className="law-kicker">RÉFÉRENTIEL TERRITORIAL PILOTE</span>
          <h2>{kasaVubuPilot.officialName}</h2>
          <p>{kasaVubuPilot.population.toLocaleString("fr-FR")} habitants • {kasaVubuPilot.surfaceKm2} km² • District de {kasaVubuPilot.district} • Relation OSM {kasaVubuPilot.osmRelationId}</p>
        </div>
        <div className="territory-hero-actions"><Link href="/carte" className="primary-btn">Ouvrir la carte interactive</Link><span>Validation administrative requise pour toute donnée opposable</span></div>
      </div>

      <div className="metrics-grid compact">
        <Mini label="Quartiers" value={String(kasaVubuQuartiers.length)} note="portail communal" />
        <Mini label="Voies référencées" value={String(totalPilotStreets)} note="référentiel OSM pilote" />
        <Mini label="Équipements repérés" value={String(territorialAssets.length)} note="inventaire initial" />
        <Mini label="Sources fortes" value={String(officialAssets)} note="officielles / sectorielles" />
      </div>

      <section className="panel territory-section">
        <div className="panel-head"><div><h2>Les 7 quartiers</h2><p>Chefferie de quartier et voies référencées dans le pilote</p></div></div>
        <div className="quartier-grid">
          {kasaVubuQuartiers.map((quartier) => {
            const streets = kasaVubuStreets[quartier.name] || [];
            return <article className="quartier-card" key={quartier.code}>
              <div className="quartier-card-head"><span>{quartier.code}</span><b>{streets.length} voies</b></div>
              <h3>{quartier.name}</h3>
              <dl><div><dt>Chef de quartier</dt><dd>{quartier.chief}</dd></div><div><dt>Adjoint</dt><dd>{quartier.deputy}</dd></div></dl>
              <details><summary>Voir les voies référencées</summary><div className="street-cloud">{streets.map((street) => <span key={street}>{street}</span>)}</div></details>
            </article>;
          })}
        </div>
      </section>

      <section className="panel territory-section">
        <div className="panel-head"><div><h2>Équipements structurants</h2><p>Inventaire cartographique initial — aucune donnée ouverte n'est automatiquement déclarée officielle</p></div><Link className="text-link" href="/structures-sanitaires">Registre sanitaire →</Link></div>
        <div className="table-wrap"><table><thead><tr><th>Équipement</th><th>Catégorie</th><th>Adresse / quartier</th><th>Validation</th><th>Source</th><th></th></tr></thead><tbody>
          {territorialAssets.map((asset) => <tr key={asset.id}><td><strong>{asset.name}</strong><br/><small>{asset.subtype}</small></td><td>{asset.category}</td><td>{asset.address || asset.quartier || "À compléter"}</td><td><span className={`data-badge ${asset.validation.toLowerCase()}`}>{asset.validation.replaceAll("_", " ")}</span></td><td>{asset.sourceLabel}</td><td>{asset.lat != null && asset.lon != null ? <Link href={`/carte?lat=${asset.lat}&lon=${asset.lon}&label=${encodeURIComponent(asset.name)}`}>Carte →</Link> : "—"}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="panel territory-section">
        <div className="panel-head"><div><h2>Provenance & gouvernance de la donnée</h2><p>Chaque couche doit conserver sa source, sa date et son niveau de validation.</p></div></div>
        <div className="source-grid">
          {territorySources.map((source) => <article key={source.label}><span>{source.kind.replaceAll("_", " ")}</span><strong>{source.label}</strong><p>{source.usage}</p></article>)}
        </div>
        <div className="legal-note territory-legal"><strong>Principe de prudence</strong><p>Le référentiel ouvert sert au repérage et au travail opérationnel. Les limites administratives, appellations officielles, responsabilités, propriétés et affectations doivent être validées par la commune ou le service sectoriel compétent avant production.</p></div>
      </section>
    </DashboardShell>
  );
}

function Mini({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric-card"><div className="metric-head"><span>{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-meta">{note}</span></article>;
}
