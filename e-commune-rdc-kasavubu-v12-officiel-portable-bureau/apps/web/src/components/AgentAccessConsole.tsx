"use client";

import { FormEvent, useEffect, useState } from "react";
import { ROLE_LABELS, type UserRole } from "@/lib/rbac";
import { ExportMenu } from "./ExportMenu";

const roles: Array<[UserRole, string]> = [
  ["BOURGMESTRE_ADJOINT", "Bourgmestre adjoint"], ["SECRETAIRE_COMMUNAL", "Secrétaire communal"], ["CHEF_SERVICE", "Chef de service"], ["ETAT_CIVIL", "Agent de l’état civil"], ["REGIE_RECETTES", "Régie des recettes"], ["MARCHES", "Marchés & étalages"], ["CAISSIER", "Caissier"], ["URBANISME", "Service urbanisme"], ["SANTE_HYGIENE", "Santé & hygiène"], ["CHEF_QUARTIER", "Chef de quartier"], ["AGENT", "Agent communal"], ["AUDITEUR", "Auditeur / contrôle"],
];
type Agent={id:string;name:string;email:string;service:string;role:UserRole;employeeRef:string;legalActRef:string;active:boolean;createdAt:string};

export function AgentAccessConsole({ canCreate }: { canCreate: boolean }) {
  const [open, setOpen] = useState(false); const [status, setStatus] = useState(""); const [sending, setSending] = useState(false); const [rows,setRows]=useState<Agent[]>([]); const [loading,setLoading]=useState(true);
  async function refresh(){setLoading(true);const response=await fetch("/api/agents",{cache:"no-store"});const data=await response.json().catch(()=>({}));if(response.ok)setRows(data.rows||[]);else setStatus(data.error||"Annuaire indisponible.");setLoading(false);}
  useEffect(()=>{void refresh();},[]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setStatus(""); const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/agents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json().catch(() => ({}));
    if (!response.ok) setStatus(data.error || "Création impossible."); else {setStatus(`Accès créé pour ${data.agent.name}. ${data.warning || ""}`);setRows(v=>[...v,data.agent]);setOpen(false);event.currentTarget.reset();} setSending(false);
  }
  async function toggle(agent:Agent){setSending(true);setStatus("");const response=await fetch(`/api/agents/${agent.id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({active:!agent.active})});const data=await response.json().catch(()=>({}));if(!response.ok)setStatus(data.error||"Mise à jour impossible.");else setRows(v=>v.map(r=>r.id===agent.id?{...r,active:!r.active}:r));setSending(false);}

  return <div className="module-stack">
    <div className="metrics-grid compact"><Mini label="Agents" value={String(rows.length)} note="PostgreSQL"/><Mini label="Actifs" value={String(rows.filter(r=>r.active).length)} note="habilités"/><Mini label="Suspendus / invitations" value={String(rows.filter(r=>!r.active).length)} note="non actifs"/><Mini label="Autorité" value={canCreate?"Bourgmestre":"Lecture"} note="création et accès"/></div>
    <section className="panel"><div className="panel-head"><div><h2>Annuaire des agents</h2><p>Comptes internes, services, rôles et état d'habilitation</p></div><div className="toolbar-actions"><ExportMenu title="Annuaire des agents" dataset="users" fileName="agents-kasa-vubu" rows={rows.map((agent)=>({nom:agent.name,email:agent.email,service:agent.service,role:ROLE_LABELS[agent.role],matricule:agent.employeeRef,acte_affectation:agent.legalActRef,etat:agent.active?"Actif":"Inactif",date_creation:agent.createdAt}))} columns={[{key:"nom",label:"Nom"},{key:"email",label:"E-mail"},{key:"service",label:"Service"},{key:"role",label:"Rôle"},{key:"matricule",label:"Matricule / référence"},{key:"acte_affectation",label:"Acte / affectation"},{key:"etat",label:"État"},{key:"date_creation",label:"Date création"}]} /><span className="data-badge officiel">{loading?"Chargement…":`${rows.length} compte(s)`}</span></div></div><div className="table-wrap"><table><thead><tr><th>Agent</th><th>Service</th><th>Rôle</th><th>Référence</th><th>État</th><th></th></tr></thead><tbody>{rows.map(agent=><tr key={agent.id}><td><b>{agent.name}</b><br/><small>{agent.email}</small></td><td>{agent.service||"—"}</td><td>{ROLE_LABELS[agent.role]}</td><td>{agent.legalActRef||agent.employeeRef||"—"}</td><td><span className={`status ${agent.active?"success":"danger"}`}>{agent.active?"Actif":"Inactif"}</span></td><td>{canCreate&&agent.role!=="BOURGMESTRE"?<button type="button" disabled={sending} onClick={()=>void toggle(agent)}>{agent.active?"Suspendre":"Activer"}</button>:"—"}</td></tr>)}</tbody></table></div></section>
    <section className="panel access-console" id="nouvel-agent"><div className="panel-head"><div><h2>Habilitations numériques</h2><p>Principe du moindre privilège et cloisonnement par commune</p></div>{canCreate && <button className="primary-btn" onClick={() => setOpen(!open)}>{open ? "Fermer" : "+ Créer un accès agent"}</button>}</div>
      {!canCreate && <div className="inline-warning">Lecture seule : seul le Bourgmestre peut créer, suspendre et attribuer les accès numériques dans sa commune.</div>}
      <div className="legal-note"><strong>Important</strong><p>La création d’un compte e‑Commune est une habilitation informatique. Elle ne vaut ni recrutement, ni nomination, ni affectation administrative. La référence de l’acte juridique ou administratif est conservée avec le compte.</p></div>
      {open && canCreate && <form className="agent-form" onSubmit={submit}><label>Nom complet<input name="name" required /></label><label>E-mail professionnel<input name="email" type="email" placeholder="prenom.nom@commune.cd" required /></label><label>Service<input name="service" placeholder="État civil, Régie, Urbanisme…" required /></label><label>Rôle<select name="role" required>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Matricule / référence interne<input name="employeeRef" /></label><label>Référence de l’acte / affectation<input name="legalActRef" placeholder="Arrêté, décision, note d’affectation…" /></label><div className="span-2 permissions-preview"><strong>Contrôles automatiques</strong><span>Commune imposée par la session • Bourgmestre non délégable • journal d’audit • compte créé inactif</span></div><button className="primary-btn span-2" disabled={sending}>{sending ? "Création…" : "Créer l’habilitation"}</button></form>}
      {status && <div className="form-success">{status}</div>}
    </section>
  </div>;
}
function Mini({label,value,note}:{label:string;value:string;note:string}){return <article className="metric-card"><div className="metric-head"><span>{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-meta">{note}</span></article>}
