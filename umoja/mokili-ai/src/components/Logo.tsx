import { Link } from "@tanstack/react-router";

export function Logo({ to = "/", compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
        <span className="h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]" />
        <span className="decor absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-flag-yellow" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          MOKILI <span className="brand-text">AI</span>
        </span>
      )}
    </Link>
  );
}