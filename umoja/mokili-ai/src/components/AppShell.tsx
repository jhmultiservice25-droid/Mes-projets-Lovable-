import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Signal,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/lib/modules";
import { useAuth } from "@/lib/auth";
import { usePreferences } from "@/lib/preferences";
import { ConsentBanner } from "@/components/ConsentBanner";

const SECONDARY = [
  { to: "/app/parametres" as const, label: "Paramètres", icon: Settings },
  { to: "/confidentialite" as const, label: "Confidentialité & sécurité", icon: ShieldCheck },
  { to: "/aide" as const, label: "Centre d'aide", icon: HelpCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { prefs } = usePreferences();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function handleSignOut() {
    signOut();
    navigate({ to: "/connexion", replace: true });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      <SideLink to="/app" label="Tableau de bord" icon={LayoutDashboard} active={pathname === "/app"} onClick={() => setOpen(false)} />
      <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Modules
      </p>
      {MODULES.map((m) => (
        <SideLink
          key={m.key}
          to={m.to}
          label={m.short}
          icon={m.icon}
          active={pathname === m.to}
          onClick={() => setOpen(false)}
        />
      ))}
      <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Compte
      </p>
      {SECONDARY.map((s) => (
        <SideLink key={s.to} to={s.to} label={s.label} icon={s.icon} active={pathname === s.to} onClick={() => setOpen(false)} />
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Logo />
        </div>
        {nav}
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs">
            <Signal className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">{prefs.connection}</span>
          </div>
          <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{user?.email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" /> Se déconnecter
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Logo />
          <Button variant="ghost" size="sm" className="ml-auto" onClick={handleSignOut} aria-label="Se déconnecter">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {open && (
          <div className="border-b border-border bg-sidebar lg:hidden">
            {nav}
          </div>
        )}

        <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:pb-10">{children}</main>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="grid grid-cols-5">
            {MODULES.map((m) => (
              <Link
                key={m.key}
                to={m.to}
                className={`flex flex-col items-center gap-1 py-2 text-[10px] ${
                  pathname === m.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <m.icon className="h-4 w-4" />
                {m.short}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ConsentBanner />
    </div>
  );
}

function SideLink({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground ring-1 ring-primary/30"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}