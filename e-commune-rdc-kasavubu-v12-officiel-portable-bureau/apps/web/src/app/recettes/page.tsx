import { DashboardShell } from "@/components/DashboardShell";
import { TaxCollectionConsole } from "@/components/TaxCollectionConsole";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function RecettesPage(){
  const session=await requirePermission("revenue:view");
  const canWrite=hasPermission(session.role,"revenue:write");
  return <DashboardShell title="Recettes & taxes" subtitle="Liquidation, perception numérique, quittances, rapprochement et audit des recettes communales">
    <div className="compliance-banner"><div><span className="banner-icon">₣</span><div><strong>Perception fondée sur un référentiel fiscal validé</strong><p>Aucun taux n'est imposé par le logiciel : chaque droit, taxe ou redevance doit être lié à sa base légale et à l'acte d'application en vigueur avant activation.</p></div></div><span className="evidence-badge">Traçabilité financière</span></div>
    <TaxCollectionConsole canWrite={canWrite}/>
  </DashboardShell>;
}
