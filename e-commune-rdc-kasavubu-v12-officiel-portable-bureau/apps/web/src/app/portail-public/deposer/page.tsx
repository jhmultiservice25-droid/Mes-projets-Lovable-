"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const services = [
  ["ETAT_CIVIL", "État civil"],
  ["URBANISME", "Urbanisme et habitat"],
  ["POPULATION", "Population et attestations"],
  ["ASSAINISSEMENT", "Assainissement et environnement"],
  ["DERCO", "Développement communautaire (DERCO)"],
  ["AGRICULTURE", "Agriculture et marchés"],
  ["SPORTS_LOISIRS", "Sports, jeunesse et loisirs"],
  ["AUTRE", "Autre service communal"],
];

export default function DeposerDossierPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{reference:string;trackingToken:string;statusLabel:string}|null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const serviceCode = String(form.get("serviceCode") || "");
    const serviceLabel = services.find(([code]) => code === serviceCode)?.[1] || "";
    const payload = {
      serviceCode, serviceLabel,
      requestType: String(form.get("requestType") || ""),
      subject: String(form.get("subject") || ""),
      description: String(form.get("description") || ""),
      requesterName: String(form.get("requesterName") || ""),
      requesterEmail: String(form.get("requesterEmail") || ""),
      requesterPhone: String(form.get("requesterPhone") || ""),
      privacyConsent: form.get("privacyConsent") === "on",
      website: String(form.get("website") || ""),
    };
    try {
      const response = await fetch("/api/public-dossiers", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Le dépôt a échoué.");
      setResult(data.dossier);
      formElement.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="public-site">
    <header className="public-header">
      <Link href="/portail-public" className="brand"><span className="brand-mark">★</span><span><small>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</small><strong>e-Commune <em>· Kasa-Vubu</em></strong></span></Link>
      <nav aria-label="Navigation publique"><Link href="/portail-public">Accueil public</Link><Link href="/portail-public/suivre">Suivre un dossier</Link></nav>
      <Link className="admin-link" href="/">Espace administratif ↗</Link>
    </header>
    <section className="section" style={{maxWidth:940,margin:"0 auto"}}>
      <span className="eyebrow">DÉMARCHES CITOYENNES</span><h1 style={{fontSize:"clamp(32px,5vw,48px)",color:"#062a45",margin:"12px 0"}}>Déposer une demande</h1>
      <p style={{color:"#637d8f",maxWidth:720}}>Votre demande sera enregistrée dans le registre numérique de Kasa-Vubu. Le dépôt ne vaut ni validation administrative ni paiement de frais.</p>
      {result ? <section style={{border:"1px solid #b8dfc8",background:"#f1fbf5",borderRadius:14,padding:24,marginTop:24}}>
        <h2 style={{color:"#17643c"}}>Demande enregistrée</h2><p>Votre référence de dossier :</p><p style={{fontSize:24,fontWeight:800,letterSpacing:1}}>{result.reference}</p><p>Code privé de suivi (à conserver, il ne sera pas affiché une seconde fois) :</p><div style={{padding:14,background:"#fff",borderRadius:8,overflowWrap:"anywhere",fontFamily:"monospace"}}>{result.trackingToken}</div><p style={{fontSize:13,marginTop:16}}>Le code permet de consulter le dossier. Ne le partagez pas. L’administration doit encore examiner la demande.</p><Link className="button primary" href="/portail-public/suivre" style={{marginTop:12}}>Suivre le dossier</Link>
      </section> : <form onSubmit={submit} style={{display:"grid",gap:16,marginTop:24,border:"1px solid #dbe6ec",borderRadius:14,padding:24,background:"#fff"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
          <label style={field}>Service compétent<select required name="serviceCode" style={control}><option value="">Choisir un service</option>{services.map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>
          <label style={field}>Type de démarche<input required name="requestType" maxLength={100} style={control} placeholder="Ex. Demande d’attestation"/></label>
          <label style={field}>Nom complet<input required name="requesterName" maxLength={120} style={control} autoComplete="name"/></label>
          <label style={field}>Adresse e-mail<input required type="email" name="requesterEmail" maxLength={180} style={control} autoComplete="email"/></label>
          <label style={field}>Téléphone<input required type="tel" name="requesterPhone" maxLength={40} style={control} autoComplete="tel" placeholder="+243…"/></label>
          <label style={field}>Objet de la demande<input required name="subject" maxLength={180} style={control}/></label>
        </div>
        <label style={field}>Description détaillée<textarea required name="description" minLength={20} maxLength={3000} rows={6} style={{...control,resize:"vertical"}} placeholder="Expliquez votre demande sans inclure de numéro de carte, mot de passe ou autre secret."/></label>
        <label style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}} aria-hidden="true">Site web<input tabIndex={-1} autoComplete="off" name="website"/></label>
        <label style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:12,color:"#536b7b"}}><input required type="checkbox" name="privacyConsent" style={{marginTop:3}}/><span>J’accepte que mes coordonnées et les informations fournies soient utilisées par le service communal compétent pour traiter cette demande.</span></label>
        {error && <p role="alert" style={{color:"#b51d32",background:"#fff0f2",padding:12,borderRadius:8}}>{error}</p>}
        <div style={{background:"#fff8d9",padding:14,borderRadius:8,fontSize:12,color:"#735e21"}}><strong>Important :</strong> ne joignez pas de pièces d’identité ni de documents sensibles dans la description. Le dépôt sécurisé de fichiers sera activé après mise en place du stockage privé et de la politique de conservation.</div>
        <button disabled={busy} className="button primary" type="submit" style={{border:0,justifySelf:"start",opacity:busy ? 0.6 : 1}}>{busy?"Enregistrement…":"Enregistrer la demande"}</button>
      </form>}
      <p style={{fontSize:11,color:"#637d8f",marginTop:18}}>En cas d’indisponibilité, contactez le guichet communal. Ce portail ne confirme pas automatiquement les frais légaux ni les pièces exigibles.</p>
    </section>
    <style>{`label{display:block}input,select,textarea{font:inherit}button:disabled{cursor:wait}`}</style>
  </main>;
}

const field: React.CSSProperties = { display:"grid", gap:7, color:"#17364d", fontSize:12, fontWeight:700 };
const control: React.CSSProperties = { width:"100%", padding:"11px 12px", border:"1px solid #cbdce5", borderRadius:8, color:"#17364d", background:"#fff", fontWeight:400 };
