import { Info } from "lucide-react";

export function DemoBadge({ children }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
      <Info className="h-3 w-3" />
      {children ?? "Démonstration"}
    </span>
  );
}

export function DemoNotice({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
      {text}
    </p>
  );
}