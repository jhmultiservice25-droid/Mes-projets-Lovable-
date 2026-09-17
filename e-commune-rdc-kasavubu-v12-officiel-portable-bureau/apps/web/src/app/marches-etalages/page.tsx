import { DashboardShell } from "@/components/DashboardShell";
import { MarketStallsConsole } from "@/components/MarketStallsConsole";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function MarketStallsPage(){
  const session=await requirePermission("business:view");
  const canWrite=hasPermission(session.role,"business:write");
  return <DashboardShell title="Marchés & étalages" subtitle="Enregistrement des emplacements, occupants, échéances, contrôles et suivi de perception">
    <div className="compliance-banner"><div><span className="banner-icon">▦</span><div><strong>Un emplacement = une référence traçable</strong><p>Le registre sépare l'occupation physique de l'étalage, l'autorisation administrative et la perception fiscale. Le paiement ne vaut pas titre de propriété.</p></div></div><span className="evidence-badge verified">Suivi terrain</span></div>
    <MarketStallsConsole canWrite={canWrite}/>
  </DashboardShell>;
}
