"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type TrackingResult = {
  dossier: { reference:string; service_label:string; request_type:string; subject:string; status:string; statusLabel:string; created_at:string; updated_at:string };
  events: Array<{ event_type:string; from_status:string|null; to_status:string|null; message:string; created_at:string; statusLabel:string|null }>;
};

export default function SuivreDossierPage() {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [result,setResult]=useState<TrackingResult|null>(null);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setResult(null);
    const form=new FormData(event.currentTarget);
    try {
      const response=await fetch("/api/public-dossiers/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:form.get("reference"),trackingToken:form.get("trackingToken")})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Suivi indisponible.");
      setResult(data);
    } catch(err) { setError(err instanceof Error?err.message:"Une erreur est survenue."); }
    finally { setBusy(false); }
  }
  return <main className="public-site">
    <header className="public-header"><Link href="/portail-public" className="brand"><span className="brand-mark">★</span><span><small>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</small><strong>e-Commune <em>· Kasa-Vubu</em></strong></span></Link><nav><Link href="/portail-public">Accueil public</Link><Link href="/portail-public/deposer">Déposer un dossier</Link></nav><Link className="admin-link" href="/">Espace administratif ↗</Link></header>
    <section className="section" style={{maxWidth:850,margin:"0 auto"}}>
      <span className="eyebrow">SUIVI CITOYEN</span><h1 style={{fontSize:"clamp(32px,5vw,48px)",color:"#062a45",margin:"12px 0"}}>Suivre un dossier</h1>
      <p style={{color:"#637d8f"}}>Saisissez la référence et le code privé obtenus lors du dépôt. Le code sert de secret d’accès à votre dossier.</p>
      <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24,border:"1px solid #dbe6ec",borderRadius:14,padding:24,background:"#fff"}}>
        <label style={field}>Référence du dossier<input required name="reference" autoCapitalize="characters" maxLength={60} style={control} placeholder="DOS-KSV-2026-ABCDEF1234"/></label>
        <label style={field}>Code privé de suivi<input required name="trackingToken" maxLength={100} style={control} autoComplete="off" placeholder="Code remis après le dépôt"/></label>
        {error&&<p role="alert" style={{color:"#b51d32"}}>{error}</p>}
        <button disabled={busy} className="button primary" style={{border:0,justifySelf:"start"}}>{busy?"Recherche…":"Consulter le dossier"}</button>
      </form>
      {result&&<section style={{marginTop:24,border:"1px solid #dbe6ec",borderRadius:14,padding:24,background:"#fff"}}>
        <span className="eyebrow">DOSSIER {result.dossier.reference}</span><h2 style={{color:"#062a45",marginTop:8}}>{result.dossier.subject}</h2><p>{result.dossier.service_label} · {result.dossier.request_type}</p><p><strong>Statut actuel :</strong> {result.dossier.statusLabel}</p><p style={{fontSize:12,color:"#637d8f"}}>Dernière mise à jour : {new Date(result.dossier.updated_at).toLocaleString("fr-FR")}</p>
        <h3 style={{marginTop:24,color:"#062a45"}}>Historique communiqué</h3><ol style={{paddingLeft:20}}>{result.events.map((item,index)=><li key={item.created_at+index} style={{padding:"0 0 18px 8px"}}><strong>{item.statusLabel||"Mise à jour"}</strong><p style={{margin:"5px 0",fontSize:13}}>{item.message}</p><time style={{fontSize:11,color:"#637d8f"}}>{new Date(item.created_at).toLocaleString("fr-FR")}</time></li>)}</ol>
        <p style={{fontSize:11,color:"#637d8f"}}>Les informations visibles ici sont limitées aux mises à jour publiées par le service. Les décisions formelles restent soumises à la procédure administrative applicable.</p>
      </section>}
    </section>
  </main>;
}
const field: React.CSSProperties = {display:"grid",gap:7,color:"#17364d",fontSize:12,fontWeight:700};
const control: React.CSSProperties = {width:"100%",padding:"11px 12px",border:"1px solid #cbdce5",borderRadius:8,color:"#17364d",background:"#fff",fontWeight:400};
