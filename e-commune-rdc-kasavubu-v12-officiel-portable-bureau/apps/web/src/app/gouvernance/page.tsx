import { DashboardShell } from "@/components/DashboardShell";
import { ActionButton } from "@/components/ActionButton";
import { requirePermission } from "@/lib/auth";
import { kasaVubuCouncil, kasaVubuPilot } from "@/lib/pilot-data";

export default async function GouvernancePage() {
  await requirePermission("governance:view");
  return (
    <DashboardShell title="Gouvernance communale" subtitle="Conseil communal, Collège exécutif, actes, décisions et programme de développement">
      <div className="executive-strip panel">
        <div><span>BOURGMESTRE</span><strong>{kasaVubuPilot.bourgmestre}</strong><small>Autorité communale • mandat référencé sur le portail officiel</small></div>
        <div><span>BOURGMESTRE ADJOINT</span><strong>{kasaVubuPilot.bourgmestreAdjoint}</strong><small>Collège exécutif communal</small></div>
        <div><span>COMMUNE PILOTE</span><strong>{kasaVubuPilot.shortName}</strong><small>Ville-Province de Kinshasa • Funa</small></div>
      </div>

      <div className="governance-grid">
        <section className="panel law-card"><span className="law-kicker">ORGANE DÉLIBÉRANT</span><h2>Conseil communal</h2><p>Délibère sur les matières d’intérêt communal : budget, comptes, développement, marchés, voirie, assainissement, patrimoine, services publics locaux et modalités des taxes conformément à la loi.</p><div className="law-ref">Loi organique n°08/016 • art. 47–53</div></section>
        <section className="panel law-card"><span className="law-kicker">ORGANE DE GESTION</span><h2>Collège exécutif communal</h2><p>Exécute les décisions du Conseil, prépare le budget, dirige les services, gère les revenus et le patrimoine, et met en œuvre le programme de développement communal.</p><div className="law-ref">Loi organique n°08/016 • art. 54–59</div></section>
        <section className="panel law-card accent"><span className="law-kicker">AUTORITÉ DE LA COMMUNE</span><h2>Bourgmestre</h2><p>Chef du Collège exécutif, responsable de l’administration, officier de l’état civil, ordonnateur principal du budget et garant de l’exécution des textes dans la juridiction.</p><div className="law-ref">Loi organique n°08/016 • art. 60–64</div></section>
      </div>

      <div className="two-col equal">
        <section className="panel"><div className="panel-head"><div><h2>Conseil communal de Kasa-Vubu</h2><p>Composition publiée par le portail communal — référentiel 2026</p></div><span className="data-badge officiel">OFFICIEL</span></div><div className="table-wrap"><table><thead><tr><th>Membre</th><th>Fonction</th></tr></thead><tbody>{kasaVubuCouncil.map((member) => <tr key={member.name}><td>{member.name}</td><td>{member.function}</td></tr>)}</tbody></table></div></section>
        <section className="panel"><div className="panel-head"><div><h2>Cycle de décision</h2><p>Traçabilité institutionnelle</p></div></div><ol className="decision-flow"><li><b>Instruction</b><span>Service compétent et pièces</span></li><li><b>Contrôle</b><span>Base légale, compétence, crédits</span></li><li><b>Délibération</b><span>Conseil / Collège selon le cas</span></li><li><b>Signature</b><span>Autorité compétente</span></li><li><b>Publication / notification</b><span>Canal officiel et archive</span></li></ol></section>
      </div>

      <section className="panel"><div className="panel-head"><div><h2>Registre des actes</h2><p>Arrêtés, décisions, délibérations et publications</p></div><ActionButton label="+ Préparer un acte" message="Le rédacteur d’actes sera relié au circuit de validation du Bourgmestre et au registre des actes." /></div><div className="table-wrap"><table><thead><tr><th>Réf.</th><th>Type</th><th>Objet</th><th>Statut</th></tr></thead><tbody><tr><td>AC-DEMO-014</td><td>Arrêté communal</td><td>Organisation interne d’un service</td><td><span className="status">Projet</span></td></tr><tr><td>DC-DEMO-008</td><td>Délibération</td><td>Programme de développement</td><td><span className="status">À inscrire</span></td></tr><tr><td>PB-DEMO-003</td><td>Publication</td><td>Décision budgétaire</td><td><span className="status">Brouillon</span></td></tr></tbody></table></div></section>
    </DashboardShell>
  );
}
