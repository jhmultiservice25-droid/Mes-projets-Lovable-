import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

type GeoFeature = { type?: string; properties?: Record<string, unknown>; geometry?: { type?: string; coordinates?: unknown } | null };
type FeatureCollection = { type?: string; features?: GeoFeature[] };

export async function POST(request: Request) {
  const ctx = await requireApiPermission("urbanism:write");
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => ({})) as { sourceReference?: string; geojson?: FeatureCollection };
  const sourceReference = String(body.sourceReference || "").trim();
  const features = body.geojson?.features;
  if (!sourceReference || body.geojson?.type !== "FeatureCollection" || !Array.isArray(features)) {
    return NextResponse.json({ error: "GeoJSON FeatureCollection et référence de source requis." }, { status: 400 });
  }
  if (features.length > 5000) return NextResponse.json({ error: "Maximum 5 000 entités par import pilote." }, { status: 400 });
  const valid = features.filter((f) => f.geometry && ["Polygon", "MultiPolygon"].includes(String(f.geometry.type)));
  if (valid.length !== features.length) return NextResponse.json({ error: "Toutes les entités doivent être Polygon ou MultiPolygon." }, { status: 400 });

  try {
    const result = await withTransaction(async (client) => {
      let inserted = 0;
      let skipped = 0;
      for (let index = 0; index < valid.length; index += 1) {
        const feature = valid[index];
        const props = feature.properties || {};
        const rawRef = props.reference ?? props.numero ?? props.id ?? `IMPORT-${Date.now()}-${index + 1}`;
        const reference = String(rawRef).trim();
        if (!reference) { skipped += 1; continue; }
        const saved = await client.query(
          `INSERT INTO parcels
            (commune_id, reference, geometry_geojson, current_use, usage_type, occupant_name, declared_owner_name,
             declared_area_m2, source_reference, validation_status, created_by, avenue_text)
           VALUES ($1,$2,$3::jsonb,$4,$4,$5,$6,$7,$8,'TO_VALIDATE',$9,$10)
           ON CONFLICT (commune_id, reference) DO NOTHING RETURNING id`,
          [ctx.session.communeId, reference, JSON.stringify(feature.geometry), String(props.usage || props.current_use || ""), String(props.occupant || ""), String(props.owner_claim || props.owner || ""), Number(props.area_m2 || props.area || 0) || null, sourceReference, ctx.session.userId, String(props.avenue || "")],
        );
        if (saved.rowCount) inserted += 1; else skipped += 1;
      }
      await writeAudit(client, {
        session: ctx.session,
        action: "PARCEL_GEOJSON_IMPORT",
        entityType: "parcel_import",
        entityId: sourceReference,
        legalReason: "Import territorial — validation administrative requise",
        afterData: { inserted, skipped, total: valid.length },
        metadata: { sourceReference },
        request,
      });
      return { inserted, skipped, total: valid.length };
    });
    return NextResponse.json({ ok: true, ...result, message: `${result.inserted} parcelle(s) importée(s), ${result.skipped} ignorée(s) car déjà présente(s) ou sans référence.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import PostgreSQL impossible." }, { status: 500 });
  }
}
