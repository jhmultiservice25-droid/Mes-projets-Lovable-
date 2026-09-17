import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { MetricCard } from "@/components/MetricCard";
import { requirePermission } from "@/lib/auth";
import { projects } from "@/lib/demo-data";
import { healthFacilities, kasaVubuPilot, kasaVubuQuartiers } from "@/lib/pilot-data";
import { territorialAssets, totalPilotStreets } from "@/lib/territory-data";

const activities = [
  ["EC-KSV-2026-00942", "Acte de naissance", "Bureau État civil", "En validation", "14:32"],
  ["TX-KSV-2026-03817", "Quittance communale", "Régie financière", "Payé", "13:51"],
  ["PL-KSV-2026-00183", "Plainte salubrité", "Service technique", "Assigné", "12:20"],
  ["UR-KSV-2026-00411", "Dossier urbanisme", "Urbanisme", "À examiner", "11:48"],
  ["CI-KSV-2026-01750", "Fiche citoyen", "Population", "Validé", "10:07"],
];

export default async function Home() {
  await requirePermission("dashboard:view");
  return (
    <DashboardShell title="Tableau de bord — Kasa-Vubu" subtitle="Pilotage consolidé de l'administration communale">
      <div className="pilot-banner">
        <div><span className="pilot-kicker">Commune pilote • District de Funa</span><strong>{kasaVubuPilot.officialName}</strong><p>Référentiel initial : {kasaVubuQuartiers.map((quartier) => quartier.name).join(" • ")}</p></div>
        <div className="pilot-facts"><span><b>{kasaVubuQuartiers.length}</b> quartiers</span><span><b>{kasaVubuPilot.surfaceKm2} km²</b> superficie</span><span><b>{kasaVubuPilot.population.toLocaleString("fr-FR")}</b> habitants</span><Link href="/territoire">Voir le territoire →</Link></div>
      </div>

      <div className="institution-alert"><div><b>Environnement pilote</b><span>Les statistiques métiers restent des données de démonstration tant qu'elles ne sont pas raccordées aux registres officiels de Kasa-Vubu.</span></div><Link href="/audit-conformite">Voir la conformité →</Link></div>

      <div className="metrics-grid">
        <MetricCard label="Citoyens au registre" value="48 726" meta="Donnée de démonstration" icon="◉" />
        <MetricCard label="Recettes du mois" value="186,4 M FC" meta="82 % de l'objectif démo" icon="₣" />
        <MetricCard label="Structures sanitaires" value={String(healthFacilities.length)} meta="Référentiel pilote non exhaustif" icon="✚" />
        <MetricCard label="Projets publics suivis" value={String(projects.length)} meta={`${projects.filter((project) => project.verified).length} fiches sourcées`} icon="▥" />
      </div>

      <div className="three-col-dashboard">
        <section className="panel activity-panel">
          <div className="panel-head"><div><h2>Activité récente</h2><p>Dernières opérations de démonstration</p></div><Link className="ghost-btn" href="/audit-conformite">Journal complet</Link></div>
          <div className="table-wrap"><table><thead><tr><th>Référence</th><th>Opération</th><th>Service</th><th>Statut</th><th>Heure</th></tr></thead><tbody>{activities.map((activity) => <tr key={activity[0]}>{activity.map((value, index) => <td key={index}>{index === 3 ? <span className="status">{value}</span> : value}</td>)}</tr>)}</tbody></table></div>
        </section>
        <aside className="panel executive-panel">
          <div className="panel-head"><div><h2>Cabinet du Bourgmestre</h2><p>Décisions et validations requises</p></div></div>
          <div className="priority"><b>12</b><span>Actes / dossiers nécessitant arbitrage</span></div>
          <div className="priority"><b>5</b><span>Habilitations d'agents à revoir</span></div>
          <div className="priority"><b>7</b><span>Engagements budgétaires à contrôler</span></div>
          <Link className="secondary-link" href="/gouvernance">Ouvrir la gouvernance →</Link>
        </aside>
      </div>

      <div className="dashboard-lower">
        <section className="panel">
          <div className="panel-head"><div><h2>Fatshimétrie locale</h2><p>Suivi probant des projets financés par l'État</p></div><Link className="text-link" href="/fatshimetrie">Tout ouvrir</Link></div>
          {projects.map((project) => <div className="mini-project" key={project.id}><div><span>{project.sector}</span><strong>{project.name}</strong></div>{project.physical != null ? <><div className="mini-progress"><i style={{ width: `${project.physical}%` }} /></div><b>{project.physical}%</b></> : <><div className="mini-progress evidence-only"><i style={{ width: "100%" }} /></div><b className="project-proof-status">Sourcé</b></>}</div>)}
        </section>
        <section className="panel territory-card">
          <div className="panel-head"><div><h2>Territoire & santé</h2><p>Carte interactive de Kasa-Vubu</p></div></div>
          <div className="territory-visual"><span>◇</span><strong>{kasaVubuQuartiers.length} quartiers • {totalPilotStreets} voies • {territorialAssets.length} équipements repérés</strong><small>Limites OSM • santé • éducation • marchés • administration • projets</small></div>
          <div className="dual-actions"><Link className="primary-btn block-link" href="/carte">Ouvrir la carte</Link><Link className="ghost-btn block-link" href="/territoire">Référentiel territorial</Link></div>
        </section>
      </div>

      <section className="panel quick-section">
        <div className="panel-head"><div><h2>Services internes</h2><p>Accès aux principales fonctions de l'ETD</p></div></div>
        <div className="quick-grid">
          {[
            ["◉", "Registre citoyen", "/citoyens", "Population & ménages"],
            ["▤", "État civil", "/etat-civil", "Naissances • mariages • décès"],
            ["₣", "Recettes", "/recettes", "Taxes • droits • quittances"],
            ["▤", "Marchés & étalages", "/marches-etalages", "Emplacements • occupants • suivi"],
            ["!", "Plaintes", "/plaintes", "Affectation • intervention • preuve"],
            ["⌗", "Urbanisme", "/urbanisme", "Parcelles • inspections • dossiers"],
            ["✚", "Santé", "/structures-sanitaires", "Structures • couverture • projets"],
            ["▧", "Territoire", "/territoire", "Quartiers • avenues • équipements"],
            ["✓", "Audit", "/audit-conformite", "Traçabilité • données • sécurité"],
          ].map(([icon, label, href, detail]) => <Link className="quick-card" key={href} href={href}><span>{icon}</span><b>{label}</b><small>{detail}</small></Link>)}
        </div>
      </section>
    </DashboardShell>
  );
}
