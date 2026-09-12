import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ConsentBanner } from "@/components/ConsentBanner";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { to: "/a-propos" as const, label: "À propos" },
  { to: "/confidentialite" as const, label: "Confidentialité & sécurité" },
  { to: "/aide" as const, label: "Centre d'aide" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Logo />
          <nav className="ml-6 hidden gap-5 text-sm text-muted-foreground md:flex">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="transition hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link to="/app">Ouvrir mon espace</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/connexion">Se connecter</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/inscription">Créer un compte</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-sidebar">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>MOKILI AI — prototype de démonstration. Aucune donnée officielle.</p>
          <nav className="flex flex-wrap gap-4">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

      <ConsentBanner />
    </div>
  );
}