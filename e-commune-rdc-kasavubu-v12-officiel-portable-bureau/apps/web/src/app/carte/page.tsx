import { DashboardShell } from "@/components/DashboardShell";
import { CommuneMap } from "@/components/CommuneMap";
import { requirePermission } from "@/lib/auth";

export default async function CartePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("map:view");
  const params = await searchParams;
  const rawLat = typeof params.lat === "string" ? Number(params.lat) : NaN;
  const rawLon = typeof params.lon === "string" ? Number(params.lon) : NaN;
  const label = typeof params.label === "string" ? params.label : "Point sélectionné";
  const initialPlace = Number.isFinite(rawLat) && Number.isFinite(rawLon) ? { label, lat: rawLat, lon: rawLon } : undefined;

  return (
    <DashboardShell title="Carte communale — Kasa-Vubu" subtitle="Quartiers, structures sanitaires, projets publics et services territoriaux">
      <CommuneMap initialPlace={initialPlace} />
    </DashboardShell>
  );
}
