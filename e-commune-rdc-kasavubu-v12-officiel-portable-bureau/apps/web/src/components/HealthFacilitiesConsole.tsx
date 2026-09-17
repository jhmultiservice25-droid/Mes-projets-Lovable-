"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { healthFacilities as initialFacilities, kasaVubuQuartiers, type HealthFacility } from "@/lib/pilot-data";
import { ExportMenu } from "./ExportMenu";

function mapHref(facility: HealthFacility) {
  if (facility.lat == null || facility.lon == null) return "/carte";
  const params = new URLSearchParams({ lat: String(facility.lat), lon: String(facility.lon), label: facility.name });
  return `/carte?${params.toString()}`;
}

export function HealthFacilitiesConsole({ canWrite }: { canWrite: boolean }) {
  const [facilities, setFacilities] = useState<HealthFacility[]>([...initialFacilities]);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Toutes");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const visible = useMemo(() => facilities.filter((facility) => {
    const matchesScope = scope === "Toutes" || (scope === "Communales" ? facility.origin === "Créée par la commune" : facility.status === scope);
    const haystack = `${facility.name} ${facility.type} ${facility.quartier || ""} ${facility.address || ""}`.toLowerCase();
    return matchesScope && haystack.includes(query.trim().toLowerCase());
  }), [facilities, query, scope]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/health-facilities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Enregistrement impossible.");
    } else {
      setFacilities((current) => [data.facility as HealthFacility, ...current]);
      setMessage(`${data.facility.name} a été ajouté au registre de travail. ${data.warning || ""}`);
      formElement.reset();
      setOpen(false);
    }
    setSending(false);
  }

  return (
    <>
      <section className="panel health-toolbar-panel">
        <div className="health-toolbar">
          <label className="health-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une structure, un quartier, une adresse…" /></label>
          <div className="segmented">
            {["Toutes", "Communales", "En activité", "À vérifier", "Projet"].map((item) => <button key={item} className={scope === item ? "active" : ""} onClick={() => setScope(item)}>{item}</button>)}
          </div>
          <ExportMenu title="Registre des structures sanitaires" dataset="health_facilities" fileName="structures-sanitaires-kasa-vubu" scopeLabel={scope!=="Toutes"||query?`filtre=${scope}; recherche=${query||"—"}`:"registre complet"} rows={visible.map((facility)=>({reference:facility.id,nom:facility.name,type:facility.type,quartier:facility.quartier||"",adresse:facility.address||"",origine:facility.origin,propriete:facility.ownership,statut:facility.status,services:facility.services,source:facility.source,statut_source:facility.sourceStatus,latitude:facility.lat??"",longitude:facility.lon??""}))} columns={[{key:"reference",label:"Référence"},{key:"nom",label:"Nom"},{key:"type",label:"Type"},{key:"quartier",label:"Quartier"},{key:"adresse",label:"Adresse"},{key:"origine",label:"Origine"},{key:"propriete",label:"Propriété / gestion"},{key:"statut",label:"Statut"},{key:"services",label:"Services"},{key:"source",label:"Source"},{key:"statut_source",label:"Statut source"},{key:"latitude",label:"Latitude"},{key:"longitude",label:"Longitude"}]} />
          {canWrite && <button className="primary-btn" onClick={() => setOpen((value) => !value)}>{open ? "Fermer" : "+ Ajouter une structure"}</button>}
        </div>
        {!canWrite && <div className="inline-warning">Votre rôle est en lecture seule pour le registre sanitaire. Les ajouts et mises à jour sont réservés aux profils habilités Santé & hygiène et au Bourgmestre.</div>}
      </section>

      {open && canWrite && <section className="panel health-create-panel">
        <div className="panel-head"><div><h2>Nouvelle structure sanitaire communale</h2><p>Création, construction ou prise en gestion par la commune</p></div><span className="evidence-badge">Traçabilité obligatoire</span></div>
        <form className="health-form" onSubmit={submit}>
          <label>Nom officiel<input name="name" required placeholder="Ex. Centre de santé communal …" /></label>
          <label>Type<select name="type" defaultValue="Centre de santé"><option>Centre de santé</option><option>Centre de santé de référence</option><option>Centre hospitalier</option><option>Maternité</option><option>Poste de secours / premiers soins</option><option>Dispensaire</option></select></label>
          <label>Quartier<select name="quartier" defaultValue=""><option value="">À déterminer</option>{kasaVubuQuartiers.map((quartier) => <option key={quartier.code}>{quartier.name}</option>)}</select></label>
          <label>État<select name="status" defaultValue="Projet"><option>Projet</option><option>À vérifier</option><option>En activité</option></select></label>
          <label className="span-2">Adresse<input name="address" placeholder="N°, avenue/rue, repère" /></label>
          <label>Référence de l'acte communal<input name="communalActRef" required placeholder="Décision / délibération / acte budgétaire…" /></label>
          <label>Autorisation / agrément sanitaire<input name="healthAuthorizationRef" placeholder="Requis avant mise en activité" /></label>
          <label>Financement<select name="funding"><option>Budget communal</option><option>État</option><option>Province</option><option>Partenariat</option><option>Mixte</option></select></label>
          <label>Référence Fatshimétrie<input name="projectId" placeholder="PIP / projet public, si applicable" /></label>
          <label className="span-2">Services prévus<input name="services" placeholder="Premiers soins, maternité, vaccination, consultations…" /></label>
          <div className="span-2 legal-note"><strong>Garde-fou réglementaire</strong><p>Le registre peut suivre une structure dès la phase projet. Le statut « En activité » exige une référence d'autorisation/agrément sanitaire ; e‑Commune ne remplace pas les compétences réglementaires des autorités sanitaires.</p></div>
          <button className="primary-btn span-2" disabled={sending}>{sending ? "Enregistrement…" : "Inscrire la structure au registre"}</button>
        </form>
      </section>}

      {message && <div className="form-success">{message}</div>}

      <div className="health-grid">
        {visible.map((facility) => (
          <article className="panel health-card" key={facility.id}>
            <div className="health-card-head">
              <div className="health-symbol">✚</div>
              <div className="health-card-status">
                <span className={`status ${facility.status === "En activité" ? "success" : facility.status === "Projet" ? "info" : ""}`}>{facility.status}</span>
                {facility.origin === "Créée par la commune" && <span className="evidence-badge">Communale</span>}
              </div>
            </div>
            <small>{facility.id} • {facility.ownership}</small>
            <h3>{facility.name}</h3>
            <p>{facility.type}</p>
            <dl className="health-details">
              <div><dt>Quartier</dt><dd>{facility.quartier || "À rattacher"}</dd></div>
              <div><dt>Adresse</dt><dd>{facility.address || "À documenter"}</dd></div>
              <div><dt>Services</dt><dd>{facility.services.join(" • ") || "À renseigner"}</dd></div>
              <div><dt>Source</dt><dd>{facility.source}</dd></div>
            </dl>
            <div className="health-card-foot">
              <span className="source-chip">{facility.sourceStatus}</span>
              <Link href={mapHref(facility)}>{facility.lat != null ? "Localiser →" : "Rechercher sur la carte →"}</Link>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && <section className="panel empty-state"><strong>Aucune structure dans ce filtre</strong><p>Modifiez la recherche ou ajoutez une nouvelle structure communale.</p></section>}
    </>
  );
}
