import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { query, withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

type StallRow = {
  id: string;
  market: string;
  code: string;
  zone: string | null;
  category: string;
  occupant: string | null;
  phone: string | null;
  activity: string | null;
  start_date: string | null;
  end_date: string | null;
  fee_ref: string | null;
  status: string;
  payment: string;
  last_inspection: string | null;
  note: string | null;
};

function toDto(row: StallRow) {
  const status = row.status === "FREE" ? "LIBRE" : row.status === "SUSPENDED" ? "SUSPENDU" : row.status === "CLOSED" ? "SUSPENDU" : "OCCUPE";
  const payment = row.payment === "CURRENT" ? "A_JOUR" : row.payment === "LATE" ? "RETARD" : "A_PAYER";
  return {
    id: row.id,
    market: row.market,
    code: row.code,
    zone: row.zone || "",
    category: row.category,
    occupant: row.occupant || "",
    phone: row.phone || "",
    activity: row.activity || "",
    start: row.start_date || "",
    end: row.end_date || "",
    feeRef: row.fee_ref || "",
    status,
    payment,
    lastInspection: row.last_inspection ? row.last_inspection.slice(0, 10) : "",
    note: row.note || "",
  };
}

const listSql = `
  SELECT s.id::text, m.name AS market, s.stall_code AS code, s.zone_code AS zone,
         s.stall_type AS category, s.occupant_name AS occupant, s.occupant_phone AS phone,
         s.activity_type AS activity, s.occupation_start::text AS start_date, s.occupation_end::text AS end_date,
         fc.code AS fee_ref, s.occupancy_status AS status, s.payment_status AS payment,
         s.last_inspection_at::text AS last_inspection, s.notes AS note
  FROM market_stalls s
  JOIN markets m ON m.id=s.market_id
  LEFT JOIN fiscal_catalog fc ON fc.id=s.fiscal_catalog_id
  WHERE s.commune_id=$1
  ORDER BY s.updated_at DESC, s.created_at DESC`;

export async function GET() {
  const ctx = await requireApiPermission("business:view");
  if (!ctx.ok) return ctx.response;
  try {
    const result = await query<StallRow>(listSql, [ctx.session.communeId]);
    return NextResponse.json({ rows: result.rows.map(toDto) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de charger les étalages." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const ctx = await requireApiPermission("business:write");
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => ({})) as {
    market?: string; code?: string; zone?: string; category?: string; occupant?: string; phone?: string; activity?: string;
    start?: string; end?: string; feeRef?: string; note?: string;
  };
  const marketName = String(body.market || "").trim();
  const code = String(body.code || "").trim().toUpperCase();
  const occupant = String(body.occupant || "").trim();
  const activity = String(body.activity || "").trim();
  if (!marketName || !code || !occupant || !activity || !body.start) {
    return NextResponse.json({ error: "Marché, code, occupant, activité et date de début sont requis." }, { status: 400 });
  }

  try {
    const created = await withTransaction(async (client) => {
      let market = await client.query<{id:string}>(`SELECT id::text FROM markets WHERE commune_id=$1 AND lower(name)=lower($2) LIMIT 1`, [ctx.session.communeId, marketName]);
      if (!market.rows[0]) {
        const marketCode = `MKT-${randomBytes(3).toString("hex").toUpperCase()}`;
        market = await client.query<{id:string}>(
          `INSERT INTO markets (commune_id, code, name, management_type, active) VALUES ($1,$2,$3,'INTERNAL_REFERENCE',TRUE) RETURNING id::text`,
          [ctx.session.communeId, marketCode, marketName],
        );
      }
      const fiscal = body.feeRef
        ? await client.query<{id:string}>(`SELECT id::text FROM fiscal_catalog WHERE commune_id=$1 AND code=$2 AND active=TRUE ORDER BY valid_from DESC LIMIT 1`, [ctx.session.communeId, String(body.feeRef).trim()])
        : { rows: [] as {id:string}[] };
      const result = await client.query<StallRow>(
        `INSERT INTO market_stalls
          (commune_id, market_id, stall_code, zone_code, stall_type, activity_type, occupant_name, occupant_phone,
           occupation_start, occupation_end, fiscal_catalog_id, occupancy_status, payment_status, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,NULLIF($10,'')::date,$11,'OCCUPIED','DUE',$12,$13)
         RETURNING id::text,
           (SELECT name FROM markets WHERE id=market_id) AS market, stall_code AS code, zone_code AS zone,
           stall_type AS category, occupant_name AS occupant, occupant_phone AS phone, activity_type AS activity,
           occupation_start::text AS start_date, occupation_end::text AS end_date,
           (SELECT code FROM fiscal_catalog WHERE id=fiscal_catalog_id) AS fee_ref,
           occupancy_status AS status, payment_status AS payment, last_inspection_at::text AS last_inspection, notes AS note`,
        [ctx.session.communeId, market.rows[0].id, code, String(body.zone || ""), String(body.category || "Étalage"), activity, occupant, String(body.phone || ""), String(body.start), String(body.end || ""), fiscal.rows[0]?.id || null, String(body.note || ""), ctx.session.userId],
      );
      const dto = toDto(result.rows[0]);
      await writeAudit(client, {
        session: ctx.session,
        action: "MARKET_STALL_CREATE",
        entityType: "market_stall",
        entityId: result.rows[0].id,
        afterData: dto,
        request,
      });
      return dto;
    });
    return NextResponse.json({ row: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Étalage non enregistré. Vérifiez l'unicité du code dans ce marché." }, { status: 409 });
  }
}
