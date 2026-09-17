import { DashboardShell } from "@/components/DashboardShell";
import { ActionButton } from "@/components/ActionButton";
import { requirePermission } from "@/lib/auth";
export default async function Page(){await requirePermission("complaints:view");return <DashboardShell title="Plaintes & interventions" subtitle="Réception, affectation, intervention terrain, preuve et clôture">
  <section className="panel"><div className="panel-head"><div><h2>Centre d’intervention</h2><p>File de démonstration</p></div><ActionButton label="+ Enregistrer une plainte" message="Le formulaire complet de plainte sera connecté au registre citoyen et à la carte. L'action est réservée aux agents disposant du droit d'écriture." /></div><div className="kanban"><div><h3>Reçues <span>2</span></h3><article><b>Salubrité</b><p>Dépôt sauvage signalé</p><small>Assossa • démo</small></article><article><b>Voirie</b><p>Caniveau obstrué</p><small>Salongo • démo</small></article></div><div><h3>Affectées <span>1</span></h3><article><b>Éclairage</b><p>Point lumineux hors service</p><small>Service technique • démo</small></article></div></div></section>
</DashboardShell>}
