"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ExportMenu } from "./ExportMenu";

type TaxRef = { id: string; code: string; label: string; legalBasis: string; act: string; amount: number; active: boolean; validFrom?: string; validUntil?: string | null };
type Payment = { id: string; reference: string; taxpayer: string; taxpayerRef: string; taxCode: string; taxLabel: string; amount: number; channel: string; externalRef: string; receipt: string; verificationToken: string; status: "PENDING" | "RECONCILED"; date: string };

function money(value: number) { return new Intl.NumberFormat("fr-CD").format(value) + " CDF"; }

export function TaxCollectionConsole({ canWrite }: { canWrite: boolean }) {
  const [taxes, setTaxes] = useState<TaxRef[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [taxOpen, setTaxOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [query, setQuery] = useState("");
  const [prefill, setPrefill] = useState<{taxpayer?:string;taxpayerRef?:string;taxCode?:string}|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function refresh() {
    setLoading(true); setError("");
    try {
      const [taxResponse,paymentResponse] = await Promise.all([fetch("/api/fiscal-catalog",{cache:"no-store"}),fetch("/api/revenue/payments",{cache:"no-store"})]);
      const taxData = await taxResponse.json(); const paymentData = await paymentResponse.json();
      if(!taxResponse.ok) throw new Error(taxData.error || "Catalogue fiscal indisponible.");
      if(!paymentResponse.ok) throw new Error(paymentData.error || "Perceptions indisponibles.");
      setTaxes(taxData.rows || []); setPayments(paymentData.rows || []);
    } catch(e) { setError(e instanceof Error ? e.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    void refresh();
    try { const raw=localStorage.getItem("ecommune.collection-prefill"); if(raw){ setPrefill(JSON.parse(raw)); setPaymentOpen(true); localStorage.removeItem("ecommune.collection-prefill"); } } catch {}
  }, []);

  const received = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const reconciled = useMemo(() => payments.filter((p) => p.status === "RECONCILED").reduce((sum, p) => sum + p.amount, 0), [payments]);
  const pending = received - reconciled;
  const filtered = payments.filter((p) => `${p.reference} ${p.taxpayer} ${p.receipt} ${p.externalRef}`.toLowerCase().includes(query.toLowerCase()));

  async function addTax(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const fd = new FormData(event.currentTarget);
    const response=await fetch("/api/fiscal-catalog",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code:fd.get("code"),label:fd.get("label"),legalBasis:fd.get("legalBasis"),act:fd.get("act"),amount:Number(fd.get("amount")||0),confirmed:fd.get("confirmed")==="yes"})});
    const data=await response.json().catch(()=>({})); setBusy(false);
    if(!response.ok){setError(data.error||"Référence fiscale non enregistrée.");return;}
    setTaxes((rows)=>[data.row,...rows]); setTaxOpen(false); event.currentTarget.reset();
  }

  async function addPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const fd = new FormData(event.currentTarget);
    const response=await fetch("/api/revenue/payments",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({taxpayer:fd.get("taxpayer"),taxpayerRef:fd.get("taxpayerRef"),taxCode:fd.get("taxCode"),amount:Number(fd.get("amount")||0),channel:fd.get("channel"),externalRef:fd.get("externalRef")})});
    const data=await response.json().catch(()=>({})); setBusy(false);
    if(!response.ok){setError(data.error||"Perception non enregistrée.");return;}
    setPayments((rows)=>[data.row,...rows]); setPaymentOpen(false); setReceipt(data.row); event.currentTarget.reset();
  }

  async function reconcile(id: string) {
    setBusy(true); setError("");
    const response=await fetch(`/api/revenue/payments/${id}/reconcile`,{method:"POST"}); const data=await response.json().catch(()=>({})); setBusy(false);
    if(!response.ok){setError(data.error||"Rapprochement impossible.");return;}
    setPayments((rows)=>rows.map((row)=>row.id===id?{...row,status:"RECONCILED"}:row));
  }

  return <div className="module-stack">
    {error&&<div className="inline-warning"><strong>PostgreSQL :</strong> {error}</div>}
    <div className="metrics-grid compact">
      <Mini label="Perçu total" value={money(received)} note="écrit en base" />
      <Mini label="Rapproché" value={money(reconciled)} note="contrôlé" />
      <Mini label="À rapprocher" value={money(pending)} note={`${payments.filter((p)=>p.status==="PENDING").length} transaction(s)`} />
      <Mini label="Références fiscales" value={String(taxes.filter(t=>t.active).length)} note="actives" />
    </div>

    <section className="panel">
      <div className="panel-head"><div><h2>Perception numérique</h2><p>Liquidation → paiement → quittance → rapprochement → audit PostgreSQL</p></div><div className="toolbar-actions"><ExportMenu title="Registre des perceptions" dataset="revenue_payments" fileName="perceptions-kasa-vubu" scopeLabel={query ? `filtre : ${query}` : "registre complet"} rows={filtered.map((p)=>({reference:p.reference,contribuable:p.taxpayer,reference_contribuable:p.taxpayerRef,taxe:p.taxLabel,code_fiscal:p.taxCode,montant_cdf:p.amount,canal:p.channel,reference_externe:p.externalRef,quittance:p.receipt,verification:p.verificationToken,statut:p.status,date:p.date}))} columns={[{key:"reference",label:"Référence"},{key:"contribuable",label:"Contribuable"},{key:"reference_contribuable",label:"Réf. contribuable"},{key:"taxe",label:"Taxe / droit"},{key:"code_fiscal",label:"Code fiscal"},{key:"montant_cdf",label:"Montant CDF"},{key:"canal",label:"Canal"},{key:"reference_externe",label:"Réf. transaction"},{key:"quittance",label:"Quittance"},{key:"verification",label:"Jeton vérification"},{key:"statut",label:"Statut"},{key:"date",label:"Date"}]} />{canWrite && <button type="button" className="primary-btn" onClick={() => setPaymentOpen(true)}>+ Enregistrer une perception</button>}</div></div>
      <div className="table-toolbar"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher contribuable, référence, quittance…"/><span className="data-badge officiel">{loading?"Chargement…":`${filtered.length} mouvement(s)`}</span></div>
      <div className="table-wrap"><table><thead><tr><th>Référence</th><th>Contribuable</th><th>Taxe</th><th>Montant</th><th>Canal</th><th>Quittance</th><th>Statut</th><th>Action</th></tr></thead><tbody>{filtered.map((p)=><tr key={p.id}><td>{p.reference}</td><td><b>{p.taxpayer}</b><br/><small>{p.taxpayerRef || "—"}</small></td><td>{p.taxLabel}</td><td>{money(p.amount)}</td><td>{p.channel}<br/><small>{p.externalRef || "—"}</small></td><td><button type="button" className="link-button" onClick={()=>setReceipt(p)}>{p.receipt}</button></td><td><span className={`status ${p.status==="RECONCILED"?"success":"info"}`}>{p.status === "RECONCILED" ? "Rapproché" : "À rapprocher"}</span></td><td>{p.status==="PENDING" && canWrite ? <button type="button" disabled={busy} onClick={()=>void reconcile(p.id)}>Rapprocher</button> : "—"}</td></tr>)}</tbody></table></div>
      {!loading&&!payments.length&&<div className="empty-state compact"><strong>Aucune perception</strong><p>Les prochaines transactions seront conservées dans PostgreSQL avec quittance et audit.</p></div>}
    </section>

    <section className="panel">
      <div className="panel-head"><div><h2>Catalogue fiscal</h2><p>Une référence n'est activée qu'après saisie de sa base légale et de son acte d'application.</p></div><div className="toolbar-actions"><ExportMenu title="Catalogue fiscal" dataset="fiscal_catalog" fileName="catalogue-fiscal-kasa-vubu" rows={taxes.map((t)=>({code:t.code,libelle:t.label,base_legale:t.legalBasis,acte:t.act,montant_cdf:t.amount,actif:t.active?"Oui":"Non",valide_du:t.validFrom||"",valide_au:t.validUntil||""}))} columns={[{key:"code",label:"Code"},{key:"libelle",label:"Libellé"},{key:"base_legale",label:"Base légale"},{key:"acte",label:"Acte d'application"},{key:"montant_cdf",label:"Montant CDF"},{key:"actif",label:"Actif"},{key:"valide_du",label:"Valide du"},{key:"valide_au",label:"Valide au"}]} />{canWrite && <button type="button" onClick={()=>setTaxOpen(true)}>+ Référence fiscale</button>}</div></div>
      <div className="table-wrap"><table><thead><tr><th>Code</th><th>Libellé</th><th>Base légale</th><th>Acte</th><th>Montant indicatif</th><th>État</th></tr></thead><tbody>{taxes.map((t)=><tr key={t.id}><td>{t.code}</td><td>{t.label}</td><td>{t.legalBasis}</td><td>{t.act}</td><td>{t.amount ? money(t.amount) : "À définir"}</td><td><span className={`status ${t.active?"success":"danger"}`}>{t.active?"Applicable":"Inactive"}</span></td></tr>)}</tbody></table></div>
    </section>

    {paymentOpen && <Modal title="Nouvelle perception" close={()=>setPaymentOpen(false)}><form className="form-grid" onSubmit={addPayment}>
      <label>Contribuable<input name="taxpayer" defaultValue={prefill?.taxpayer || ""} required /></label><label>Référence contribuable<input name="taxpayerRef" defaultValue={prefill?.taxpayerRef || ""} placeholder="NIF / registre / code étalage" /></label>
      <label>Référence fiscale<select name="taxCode" defaultValue={prefill?.taxCode || ""} required><option value="" disabled>Choisir une référence active</option>{taxes.filter((t)=>t.active).map((t)=><option value={t.code} key={t.id}>{t.code} — {t.label}</option>)}</select></label><label>Montant CDF<input name="amount" type="number" min="1" required /></label>
      <label>Canal<select name="channel" required><option>Caisse</option><option>Mobile Money</option><option>Banque</option></select></label><label>Référence transaction<input name="externalRef" placeholder="Référence opérateur/banque" /></label>
      <div className="span-2 modal-actions"><button type="button" onClick={()=>setPaymentOpen(false)}>Annuler</button><button className="primary-btn" disabled={!canWrite||busy}>{busy?"Enregistrement…":"Valider et générer la quittance"}</button></div>
    </form></Modal>}

    {taxOpen && <Modal title="Nouvelle référence fiscale" close={()=>setTaxOpen(false)}><form className="form-grid" onSubmit={addTax}>
      <label>Code<input name="code" required /></label><label>Libellé<input name="label" required /></label><label className="span-2">Base légale<input name="legalBasis" required /></label><label className="span-2">Acte de mise en œuvre<input name="act" required /></label><label>Montant indicatif CDF<input name="amount" type="number" min="0" /></label><label className="span-2 checkbox-line"><input name="confirmed" value="yes" type="checkbox" required /> Je confirme que cette référence, sa base légale et son acte de mise en œuvre ont été vérifiés par le service compétent.</label>
      <div className="span-2 modal-actions"><button type="button" onClick={()=>setTaxOpen(false)}>Annuler</button><button className="primary-btn" disabled={busy}>{busy?"Enregistrement…":"Enregistrer et activer"}</button></div>
    </form></Modal>}

    {receipt && <Modal title="Quittance de perception" close={()=>setReceipt(null)}><div className="receipt-card"><small>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • COMMUNE DE KASA‑VUBU</small><h3>Quittance {receipt.receipt}</h3><dl><div><dt>Contribuable</dt><dd>{receipt.taxpayer}</dd></div><div><dt>Référence</dt><dd>{receipt.reference}</dd></div><div><dt>Nature</dt><dd>{receipt.taxLabel}</dd></div><div><dt>Montant</dt><dd>{money(receipt.amount)}</dd></div><div><dt>Canal</dt><dd>{receipt.channel}</dd></div><div><dt>Transaction</dt><dd>{receipt.externalRef || "—"}</dd></div></dl><div className="receipt-token">VÉRIFICATION : {receipt.verificationToken}</div></div><div className="modal-actions"><ExportMenu title={`Quittance ${receipt.receipt}`} dataset="revenue_receipts" fileName={`quittance-${receipt.receipt}`} scopeLabel="quittance unique" rows={[{quittance:receipt.receipt,contribuable:receipt.taxpayer,reference:receipt.reference,nature:receipt.taxLabel,montant_cdf:receipt.amount,canal:receipt.channel,transaction:receipt.externalRef,verification:receipt.verificationToken,date:receipt.date}]} columns={[{key:"quittance",label:"Quittance"},{key:"contribuable",label:"Contribuable"},{key:"reference",label:"Référence"},{key:"nature",label:"Nature"},{key:"montant_cdf",label:"Montant CDF"},{key:"canal",label:"Canal"},{key:"transaction",label:"Transaction"},{key:"verification",label:"Vérification"},{key:"date",label:"Date"}]} /><button type="button" onClick={()=>window.print()}>Imprimer</button><button className="primary-btn" type="button" onClick={()=>setReceipt(null)}>Fermer</button></div></Modal>}
  </div>;
}

function Mini({label,value,note}:{label:string;value:string;note:string}) { return <article className="metric-card"><div className="metric-head"><span>{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-meta">{note}</span></article>; }
function Modal({title, close, children}:{title:string;close:()=>void;children:ReactNode}) { return <div className="modal-backdrop" onClick={close}><div className="modal-card" onClick={(e)=>e.stopPropagation()}><div className="modal-head"><div><small>e‑Commune Kasa‑Vubu</small><h3>{title}</h3></div><button className="icon-btn" type="button" onClick={close}>×</button></div>{children}</div></div>; }
