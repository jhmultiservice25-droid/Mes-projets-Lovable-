import { NextResponse } from "next/server";
import { kasaVubuPilot, kasaVubuQuartiers } from "@/lib/pilot-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OverpassGeometryPoint = { lat: number; lon: number };
type OverpassMember = { type: string; ref: number; role?: string; geometry?: OverpassGeometryPoint[] };
type OverpassElement = { type: string; id: number; tags?: Record<string, string>; members?: OverpassMember[] };
type OverpassResponse = { elements?: OverpassElement[] };

const quartierPattern = kasaVubuQuartiers
  .map((quartier) => quartier.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("O\\.N\\.L\\.", "O\\.?N\\.?L\\.?"))
  .join("|");

const query = `[out:json][timeout:25];
(
  relation(${kasaVubuPilot.osmRelationId});
  relation["boundary"="administrative"]["admin_level"="8"]["name"~"^(${quartierPattern})$"](around:6500,${kasaVubuPilot.center.lat},${kasaVubuPilot.center.lon});
);
out geom;`;

function toGeoJson(payload: OverpassResponse) {
  const features: Array<Record<string, unknown>> = [];
  for (const element of payload.elements || []) {
    if (element.type !== "relation") continue;
    const relationName = element.tags?.name || `Relation ${element.id}`;
    const boundaryClass = element.id === kasaVubuPilot.osmRelationId ? "commune" : "quartier";
    for (const member of element.members || []) {
      if (member.type !== "way" || !member.geometry || member.geometry.length < 2) continue;
      features.push({
        type: "Feature",
        properties: {
          relationId: element.id,
          relationName,
          boundaryClass,
          role: member.role || "",
          source: "OpenStreetMap",
          legalStatus: "Référentiel cartographique à valider administrativement",
        },
        geometry: {
          type: "LineString",
          coordinates: member.geometry.map((point) => [point.lon, point.lat]),
        },
      });
    }
  }
  return { type: "FeatureCollection", features };
}

async function fetchOverpass() {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  let lastError = "Service cartographique indisponible";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "user-agent": "e-Commune-RDC-Kasa-Vubu/1.0",
        },
        body: new URLSearchParams({ data: query }),
        next: { revalidate: 86400 },
      });
      if (!response.ok) {
        lastError = `${endpoint} a répondu ${response.status}`;
        continue;
      }
      const payload = (await response.json()) as OverpassResponse;
      return { geojson: toGeoJson(payload), provider: endpoint };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  return { geojson: { type: "FeatureCollection", features: [] }, provider: null, warning: lastError };
}

export async function GET() {
  const result = await fetchOverpass();
  return NextResponse.json({
    ...result,
    relationId: kasaVubuPilot.osmRelationId,
    note: "La géométrie OSM sert de référentiel cartographique. Une limite opposable doit être validée par l'autorité administrative compétente.",
  });
}
