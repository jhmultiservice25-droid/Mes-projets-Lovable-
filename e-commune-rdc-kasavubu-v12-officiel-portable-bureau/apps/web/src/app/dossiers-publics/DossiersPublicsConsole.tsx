"use client";

import { useEffect, useState } from "react";

type Dossier = { id:string; reference:string; service_label:string; request_type:string; subject:string; requester_name:string; requester_email:string; requester_phone:string; status:string; statusLabel:string; created_at:string; updated_at:string; assigned_name:string|null };
const statuses = [
  ["UNDER_REVIEW","En cours d’examen"],["NEEDS_INFO","Informations complémentaires requises"],["APPROVED","Avis favorable"],["REJECTED","Avis défavorable"],["COMPLETED","Traité"],
];

export function DossiersPublicsConsole() {
  const [rows,setRows]=useState<Dossier[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState("ALL");
  const [selected,setSelected]=useState<Dossier|null>(null);
  const [status,setStatus]=useState("UNDER_REVIEW");
  const [publicMessage,setPublicMessage]=useState("");
  const [internalNote,setInternalNote]=useState("");
  const [saving,setSaving]=useState(false);
  async function load() {
    setLoading(true);setError("");
    try { const r=await fetch("/api/public-dossiers",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Chargement impossible.");setRows(d.rows||[]); }
    catch(e){setError(e instanceof Error?e.message:"Registre indisponible.");}finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  async function save() {
    if(!selected)return;
    setSaving(true);setError("");
    try {
      const r=await fetch(`/api/public-dossiers/${selected.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,publicMessage,internalNote})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Mise à jour impossible.");
      setSelected(null);setPublicMessage("");setInternalNote("");await load();
    }catch(e){setError(e instanceof Error?e.message:"Mise à jour impossible.");}finally{setSaving(false);}
  }
  const visible=rows.filter(row=>filter==="ALL"||row.status===filter);
  return <div className="content">
    <div className="institution-alert"><div><b>Dossiers citoyens</b><span>Registre réel alimenté par les dépôts publics enregistrés dans PostgreSQL.</span></div><button className="ghost-btn" onClick={()=>void load()}>Actualiser</button></div>
    <div className="metrics-grid">
      <div className="metric-card"><div className="metric-head">Total dossiers</div><strong className="metric-value">{rows.length}</strong></div>
      <div className="metric-card"><div className="metric-head">Reçus</div><strong className="metric-value">{rows.filter(x=>x.status==="RECEIVED").length}</strong></div>
      <div className="metric-card"><div className="metric-head">En examen</div><strong className="metric-value">{rows.filter(x=>x.status==="UNDER_REVIEW").length}</strong></div>
      <div className="metric-card"><div className="metric-head">À compléter</div><strong className="metric-value">{rows.filter(x=>x.status==="NEEDS_INFO").length}</strong></div>
    </div>
    {error&&<p role="alert" style={{padding:12,background:"#fff0f2",color:"#b51d32",borderRadius:8}}>{error}</p>}
    <section className="panel">
      <div className="panel-head"><div><h2>Registre des demandes</h2><p>Les données personnelles ne sont accessibles qu’aux agents autorisés de cette commune.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">Tous les statuts</option><option value="RECEIVED">Reçus</option><option value="UNDER_REVIEW">En examen</option><option value="NEEDS_INFO">À compléter</option><option value="APPROVED">Avis favorable</option><option value="REJECTED">Avis défavorable</option><option value="COMPLETED">Traités</option></select></div>
      {loading?<p>Chargement du registre…</p>:visible.length===0?<p>Aucun dossier pour ce filtre.</p>:<div className="table-wrap"><table><thead><tr><th>Référence</th><th>Demandeur</th><th>Service / objet</th><th>Statut</th><th>Reçu le</th><th>Action</th></tr></thead><tbody>{visible.map(row=><tr key={row.id}><td>{row.reference}</td><td>{row.requester_name}<br/><small>{row.requester_email}<br/>{row.requester_phone}</small></td><td>{row.service_label}<br/><strong>{row.subject}</strong><br/><small>{row.request_type}</small></td><td><span className="status info">{row.statusLabel}</span></td><td>{new Date(row.created_at).toLocaleDateString("fr-FR")}</td><td><button className="ghost-btn" onClick={()=>{setSelected(row);setStatus(row.status==="RECEIVED"?"UNDER_REVIEW":row.status);setPublicMessage("");setInternalNote("");}}>Traiter</button></td></tr>)}</tbody></table></div>}
    </section>
    {selected&&<div role="dialog" aria-modal="true" aria-label="Traiter le dossier" style={{position:"fixed",inset:0,zIndex:100,background:"#061d34aa",display:"grid",placeItems:"center",padding:18}}><section className="panel" style={{width:"min(700px,100%)",maxHeight:"90vh",overflow:"auto"}}>
      <div className="panel-head"><div><h2>Traiter {selected.reference}</h2><p>{selected.requester_name} · {selected.requester_email} · {selected.requester_phone}</p></div><button className="ghost-btn" onClick={()=>setSelected(null)}>Fermer</button></div>
      <p><strong>{selected.subject}</strong></p><p style={{whiteSpace:"pre-wrap"}}>{selected.request_type} · {selected.service_label}</p>
      <label style={label}>Nouveau statut<select style={input} value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>
      <label style={label}>Message visible par le citoyen<textarea style={input} rows={3} maxLength={1000} value={publicMessage} onChange={e=>setPublicMessage(e.target.value)} placeholder="Expliquer les pièces manquantes ou la prochaine étape."/></label>
      <label style={label}>Note interne (non visible au citoyen)<textarea style={input} rows={3} maxLength={2000} value={internalNote} onChange={e=>setInternalNote(e.target.value)} placeholder="Note interne de traitement."/></label>
      <p style={{fontSize:11,color:"#637d8f"}}>La modification est journalisée. N’inscrivez pas de données sensibles non nécessaires dans les notes.</p>
      <button className="primary-btn" disabled={saving} onClick={()=>void save()}>{saving?"Enregistrement…":"Enregistrer le traitement"}</button>
    </section></div>}
  </div>;
}
const label:React.CSSProperties={display:"grid",gap:7,margin:"14px 0",fontSize:12,fontWeight:700};
const input:React.CSSProperties={width:"100%",padding:10,border:"1px solid #cbd7e1",borderRadius:7,background:"#fff",color:"#142333"};
