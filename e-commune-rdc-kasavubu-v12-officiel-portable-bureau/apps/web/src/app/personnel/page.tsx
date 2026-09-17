import { DashboardShell } from "@/components/DashboardShell";
import { AgentAccessConsole } from "@/components/AgentAccessConsole";
import { requirePermission } from "@/lib/auth";
import { canCreateAgents } from "@/lib/rbac";

export default async function PersonnelPage() {
  const session = await requirePermission("personnel:view");
  const canCreate = canCreateAgents(session.role);
  return <DashboardShell title="Personnel & accès" subtitle="Agents, services, rôles, habilitations et séparation des responsabilités">
    <div className="compliance-banner"><div><span className="banner-icon">♙</span><div><strong>Autorité d’habilitation</strong><p>Le Bourgmestre est le seul compte autorisé à créer, suspendre ou modifier les accès des agents de sa commune. Chaque modification est désormais écrite dans le journal d’audit PostgreSQL.</p></div></div><span className="evidence-badge verified">Contrôle serveur + DB</span></div>
    <AgentAccessConsole canCreate={canCreate} />
  </DashboardShell>;
}
