import { DashboardShell } from "@/components/DashboardShell";
import { ActionButton } from "@/components/ActionButton";
import { AuditLogConsole } from "@/components/AuditLogConsole";
import { requirePermission } from "@/lib/auth";

const controls = [
  ["Habilitations", "Bourgmestre seul pour la création et la suspension des comptes agents", "Branché PostgreSQL", "ok"],
  ["Cloisonnement", "Chaque requête métier est filtrée par la commune de la session", "Actif dans les API", "ok"],
  ["Journal d’audit", "Créations, perceptions, rapprochements, parcelles, étalages et inspections", "Stockage PostgreSQL actif", "ok"],
  ["Données personnelles", "Finalité, base légale, minimisation, droits", "Registre à compléter", "warn"],
  ["Archivage", "Intégrité, cycle de vie, preuve et conservation", "Politique à formaliser", "warn"],
  ["Homologation / autorisations", "Formalités numériques applicables au secteur public", "Validation juridique avant production", "risk"],
];

export default async function AuditPage() {
  await requirePermission("audit:view");
  return <DashboardShell title="Audit & conformité" subtitle="Contrôles de sécurité, protection des données, traçabilité et droit numérique">
    <div className="compliance-score panel"><div><span>État technique</span><strong>DB<span>✓</span></strong><p>Les nouveaux workflows sensibles sont persistés et audités. Cet état technique ne constitue pas une certification juridique.</p></div><div className="donut" aria-label="backend connecté"><span>DB</span></div></div>
    <section className="panel"><div className="panel-head"><div><h2>Matrice de conformité</h2><p>Exigences à satisfaire avant mise en production administrative</p></div><a className="ghost-btn" href="#registre-traitements">Registre des traitements</a></div><div className="control-list">{controls.map(([title, requirement, state, tone]) => <div className="control-row" key={title}><span className={`control-dot ${tone}`} /><div><strong>{title}</strong><p>{requirement}</p></div><span className={`control-state ${tone}`}>{state}</span></div>)}</div></section>
    <AuditLogConsole/>
    <div className="two-col equal" id="registre-traitements"><section className="panel"><div className="panel-head"><div><h2>Registre des traitements</h2><p>Code du numérique — données personnelles</p></div><ActionButton label="+ Traitement" message="Le formulaire complet du registre des traitements reste à connecter : finalité, base légale, catégories, destinataires et conservation." /></div><div className="registry-item"><strong>État civil</strong><span>Finalité : tenue et délivrance des actes • base légale à documenter</span></div><div className="registry-item"><strong>Registre citoyen communal</strong><span>Finalité : administration territoriale • minimisation requise</span></div><div className="registry-item"><strong>Recettes communales</strong><span>Finalité : liquidation, perception, contrôle • durée à formaliser</span></div></section><section className="panel"><div className="panel-head"><div><h2>Événements désormais audités</h2><p>Exemples de codes écrits automatiquement</p></div></div><div className="audit-line"><b>AGENT_ACCOUNT_CREATE</b><span>Création d’un accès agent</span><small>Bourgmestre uniquement</small></div><div className="audit-line"><b>REVENUE_PAYMENT_CREATE</b><span>Perception et émission d’une quittance</span><small>Agent + référence fiscale</small></div><div className="audit-line"><b>PARCEL_DIGITIZE_CREATE</b><span>Numérisation d’une parcelle</span><small>Source + géométrie</small></div><div className="audit-line"><b>MARKET_STALL_INSPECTION_CREATE</b><span>Contrôle terrain d’un étalage</span><small>Agent + horodatage</small></div><div className="audit-line"><b>DATA_EXPORT</b><span>Téléchargement d’un registre ou d’une quittance</span><small>Format + volume + périmètre</small></div></section></div>
  </DashboardShell>;
}
