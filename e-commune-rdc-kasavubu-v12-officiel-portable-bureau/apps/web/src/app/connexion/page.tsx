import { StateEmblem } from "@/components/StateEmblem";
import { LoginForm } from "./LoginForm";

export default function ConnexionPage() {
  return (
    <main className="login-page">
      <div className="state-ribbon login-ribbon" aria-hidden><i /><i /><i /></div>
      <section className="login-hero">
        <div className="login-seal"><StateEmblem size={96} /></div>
        <p className="eyebrow">République démocratique du Congo</p>
        <h1>e‑Commune</h1>
        <p>Pilote Kasa-Vubu : plateforme interne de gouvernance, de gestion administrative, sanitaire et de suivi territorial de la commune.</p>
        <div className="login-principles"><span>Justice</span><span>Paix</span><span>Travail</span></div>
      </section>
      <section className="login-card">
        <div><p className="eyebrow">Accès sécurisé</p><h2>Administration de Kasa-Vubu</h2><p>Les habilitations sont limitées à la commune et aux fonctions attribuées. Toute opération sensible est destinée à être journalisée.</p></div>
        <LoginForm />
        <small>Usage réservé aux agents autorisés • Code du numérique • droit positif congolais</small>
      </section>
    </main>
  );
}
