"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Permission, UserRole } from "@/lib/rbac";
import { hasPermission } from "@/lib/rbac";

const nav: Array<{ icon: string; label: string; href: string; permission: Permission }> = [
  { icon: "⌂", label: "Tableau de bord", href: "/", permission: "dashboard:view" },
  { icon: "◉", label: "Citoyens", href: "/citoyens", permission: "citizens:view" },
  { icon: "▤", label: "État civil", href: "/etat-civil", permission: "civil:view" },
  { icon: "₣", label: "Recettes & taxes", href: "/recettes", permission: "revenue:view" },
  { icon: "▦", label: "Commerces", href: "/commerces", permission: "business:view" },
  { icon: "▤", label: "Marchés & étalages", href: "/marches-etalages", permission: "business:view" },
  { icon: "!", label: "Plaintes & interventions", href: "/plaintes", permission: "complaints:view" },
  { icon: "⌗", label: "Urbanisme", href: "/urbanisme", permission: "urbanism:view" },
  { icon: "▱", label: "Parcelles & domaine", href: "/parcelles", permission: "urbanism:view" },
  { icon: "✚", label: "Structures sanitaires", href: "/structures-sanitaires", permission: "health:view" },
  { icon: "▧", label: "Territoire & équipements", href: "/territoire", permission: "map:view" },
  { icon: "◇", label: "Carte communale", href: "/carte", permission: "map:view" },
  { icon: "▥", label: "Fatshimétrie locale", href: "/fatshimetrie", permission: "projects:view" },
  { icon: "§", label: "Gouvernance", href: "/gouvernance", permission: "governance:view" },
  { icon: "♙", label: "Personnel & accès", href: "/personnel", permission: "personnel:view" },
  { icon: "✓", label: "Audit & conformité", href: "/audit-conformite", permission: "audit:view" },
  { icon: "⚙", label: "Paramètres", href: "/parametres", permission: "settings:manage" },
];

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale">
      {nav.filter((item) => hasPermission(role, item.permission)).map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`nav-link${active ? " active" : ""}`}>
            <span className="nav-icon" aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
