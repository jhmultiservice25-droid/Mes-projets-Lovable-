import Link from "next/link";
import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth";
import { ROLE_LABELS, hasPermission } from "@/lib/rbac";
import { StateEmblem } from "./StateEmblem";
import { SidebarNav } from "./SidebarNav";
import { LogoutButton } from "./LogoutButton";
import { NotificationsButton } from "./NotificationsButton";

export async function DashboardShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const session = await requireSession();
  const initials = session.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <StateEmblem size={54} />
          <div className="brand-copy">
            <small>République démocratique du Congo</small>
            <strong>e‑Commune</strong>
            <span>Administration territoriale</span>
          </div>
        </div>

        <div className="commune-card">
          <small>Entité territoriale décentralisée</small>
          <strong>{session.communeName}</strong>
          <span>{session.province} • RDC</span>
        </div>

        <SidebarNav role={session.role} />

        <div className="sidebar-footer">
          <div className="avatar">{initials}</div>
          <div className="profile-copy">
            <strong>{session.name}</strong>
            <span>{ROLE_LABELS[session.role]}</span>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="state-ribbon" aria-hidden><i /><i /><i /></div>
        <header className="topbar">
          <div>
            <div className="breadcrumb">e‑Commune / {session.communeName} / {title}</div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="top-actions">
            <label className="global-search"><span>⌕</span><input aria-label="Recherche globale" placeholder="Référence, citoyen, dossier…" /></label>
            <NotificationsButton />
            {hasPermission(session.role, "agents:create") ? <Link className="primary-btn" href="/personnel#nouvel-agent">+ Créer un accès agent</Link> : <Link className="primary-btn" href="/carte">Ouvrir la carte</Link>}
          </div>
        </header>
        <section className="content">{children}</section>
        <footer className="app-footer">
          <span>e‑Commune RDC • système interne</span>
          <span>Traçabilité • moindre privilège • intégrité documentaire</span>
        </footer>
      </main>
    </div>
  );
}
