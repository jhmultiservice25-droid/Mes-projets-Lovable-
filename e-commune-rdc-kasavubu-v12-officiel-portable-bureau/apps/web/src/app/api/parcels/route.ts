import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { query, withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

type ParcelRow = {
  id: string;
  reference: string;
  quartier: string | null;
  avenue: string | null;
  usage: string | null;
  occupant: string | null;
  owner_claim: string | null;
  area: string | null;
  source: string | null;
  status: string;
  geometry: { type?: string; coordinates?: unknown } | null;
  created_at: string;
};

type Point = { lat: number; lon: number };

function pointsFromGeometry(geometry: ParcelRow["geometry"]): Point[] {
  if (!geometry || geometry.type !== "Polygon" || !Array.isArray(geometry.coordinates)) return [];
  const ring = geometry.coordinates[0];
  if (!Array.isArray(ring)) return [];
  const points = ring
    .filter((item): item is [number, number] => Array.isArray(item) && item.length >= 2 && Number.isFinite(Number(item[0])) && Number.isFinite(Number(item[1])))
    .map(([lon, lat]) => ({ lon: Number(lon), lat: Number(lat) }));
  if (points.length > 1 && points[0].lat === points.at(-1)?.lat && points[0].lon === points.at(-1)?.lon) points.pop();
  return points;
}

function toDto(row: ParcelRow) {
  return {
    id: row.id,
    reference: row.reference,
    quartier: row.quartier || "À qualifier",
    avenue: row.avenue || "",
    usage: row.usage || "",
    occupant: row.occupant || "",
    ownerClaim: row.owner_claim || "",
    area: Number(row.area || 0),
    source: row.source || "",
    status: row.status === "VALIDATED" ? "VALIDEE" : row.status === "DISPUTED" ? "LITIGE" : "A_VALIDER",
    points: pointsFromGeometry(row.geometry),
    createdAt: row.created_at,
  };
}

const listSql = `
  SELECT p.id::text, p.reference, q.name AS quartier,
         COALESCE(a.name,p.avenue_text) AS avenue,
         COALESCE(p.usage_type,p.current_use) AS usage,
         p.occupant_name AS occupant, p.declared_owner_name AS owner_claim,
         p.declared_area_m2::text AS area, p.source_reference AS source,
         p.validation_status AS status, p.geometry_geojson AS geometry, p.created_at::text
  FROM parcels p
  LEFT JOIN quartiers q ON q.id=p.quartier_id
  LEFT JOIN avenues a ON a.id=p.avenue_id
  WHERE p.commune_id=$1
  ORDER BY p.created_at DESC`;

export async function GET() {
  const ctx = await requireApiPermission("urbanism:view");
  if (!ctx.ok) return ctx.response;
  try {
    const result = await query<ParcelRow>(listSql, [ctx.session.communeId]);
    return NextResponse.json({ rows: result.rows.map(toDto) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de charger les parcelles." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const ctx = await requireApiPermission("urbanism:write");
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => ({})) as {
    reference?: string; quartier?: string; avenue?: string; usage?: string; occupant?: string; ownerClaim?: string;
    area?: number; source?: string; points?: Point[];
  };
  const reference = String(body.reference || "").trim();
  const quartier = String(body.quartier || "").trim();
  const avenue = String(body.avenue || "").trim();
  const source = String(body.source || "").trim();
  const points = Array.isArray(body.points) ? body.points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)) : [];
  if (!reference || !quartier || !avenue || !source || points.length < 3) {
    return NextResponse.json({ error: "Référence, localisation, source et au moins 3 sommets GPS sont requis." }, { status: 400 });
  }
  const closed = [...points.map((p) => [p.lon, p.lat]), [points[0].lon, points[0].lat]];
  const geometry = { type: "Polygon", coordinates: [closed] };

  try {
    const created = await withTransaction(async (client) => {
      const q = await client.query<{id:string}>(`SELECT id::text FROM quartiers WHERE commune_id=$1 AND lower(name)=lower($2) LIMIT 1`, [ctx.session.communeId, quartier]);
      const a = await client.query<{id:string}>(`SELECT id::text FROM avenues WHERE commune_id=$1 AND lower(name)=lower($2) LIMIT 1`, [ctx.session.communeId, avenue]);
      const result = await client.query<ParcelRow>(
        `INSERT INTO parcels
          (commune_id, reference, quartier_id, avenue_id, avenue_text, geometry_geojson, current_use, usage_type,
           occupant_name, declared_owner_name, declared_area_m2, source_reference, validation_status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$7,$8,$9,$10,$11,'TO_VALIDATE',$12)
         RETURNING id::text, reference,
           (SELECT name FROM quartiers WHERE id=quartier_id) AS quartier,
           COALESCE((SELECT name FROM avenues WHERE id=avenue_id),avenue_text) AS avenue,
           COALESCE(usage_type,current_use) AS usage, occupant_name AS occupant, declared_owner_name AS owner_claim,
           declared_area_m2::text AS area, source_reference AS source, validation_status AS status,
           geometry_geojson AS geometry, created_at::text`,
        [ctx.session.communeId, reference, q.rows[0]?.id || null, a.rows[0]?.id || null, avenue, JSON.stringify(geometry), String(body.usage || ""), String(body.occupant || ""), String(body.ownerClaim || ""), Number(body.area || 0) || null, source, ctx.session.userId],
      );
      const dto = toDto(result.rows[0]);
      await writeAudit(client, {
        session: ctx.session,
        action: "PARCEL_DIGITIZE_CREATE",
        entityType: "parcel",
        entityId: result.rows[0].id,
        legalReason: "Numérisation territoriale — validation administrative requise",
        afterData: dto,
        metadata: { sourceReference: source, vertexCount: points.length },
        request,
      });
      return dto;
    });
    return NextResponse.json({ row: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Parcelle non enregistrée. Vérifiez notamment l'unicité de la référence." }, { status: 409 });
  }
}
