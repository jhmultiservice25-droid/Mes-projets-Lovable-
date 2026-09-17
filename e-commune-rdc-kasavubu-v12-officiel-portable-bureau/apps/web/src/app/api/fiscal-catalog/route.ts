import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { query, withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

type FiscalRow = {
  id: string;
  code: string;
  label: string;
  legal_basis_reference: string;
  implementation_act_reference: string | null;
  amount_cdf: string | null;
  active: boolean;
  valid_from: string;
  valid_until: string | null;
};

function toDto(row: FiscalRow) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    legalBasis: row.legal_basis_reference,
    act: row.implementation_act_reference || "",
    amount: Number(row.amount_cdf || 0),
    active: row.active,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
  };
}

export async function GET() {
  const ctx = await requireApiPermission("revenue:view");
  if (!ctx.ok) return ctx.response;
  try {
    const result = await query<FiscalRow>(
      `SELECT id::text, code, label, legal_basis_reference, implementation_act_reference,
              calculation_rule->>'flat_amount_cdf' AS amount_cdf, active,
              valid_from::text, valid_until::text
       FROM fiscal_catalog
       WHERE commune_id=$1
       ORDER BY active DESC, code ASC, valid_from DESC`,
      [ctx.session.communeId],
    );
    return NextResponse.json({ rows: result.rows.map(toDto) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de charger le catalogue fiscal." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const ctx = await requireApiPermission("revenue:write");
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => ({})) as {
    code?: string; label?: string; legalBasis?: string; act?: string; amount?: number; confirmed?: boolean; validFrom?: string;
  };
  const code = String(body.code || "").trim().toUpperCase();
  const label = String(body.label || "").trim();
  const legalBasis = String(body.legalBasis || "").trim();
  const act = String(body.act || "").trim();
  const amount = Number(body.amount || 0);
  if (!code || !label || !legalBasis || !act || !body.confirmed || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Base légale, acte d'application et confirmation de validation sont requis." }, { status: 400 });
  }

  try {
    const row = await withTransaction(async (client) => {
      const inserted = await client.query<FiscalRow>(
        `INSERT INTO fiscal_catalog
          (commune_id, code, label, legal_basis_reference, implementation_act_reference, calculation_rule, valid_from, active)
         VALUES ($1,$2,$3,$4,$5,jsonb_build_object('flat_amount_cdf',$6::numeric),COALESCE($7::date,current_date),TRUE)
         RETURNING id::text, code, label, legal_basis_reference, implementation_act_reference,
                   calculation_rule->>'flat_amount_cdf' AS amount_cdf, active, valid_from::text, valid_until::text`,
        [ctx.session.communeId, code, label, legalBasis, act, amount, body.validFrom || null],
      );
      const created = inserted.rows[0];
      await writeAudit(client, {
        session: ctx.session,
        action: "FISCAL_CATALOG_CREATE",
        entityType: "fiscal_catalog",
        entityId: created.id,
        legalReason: legalBasis,
        afterData: toDto(created),
        request,
      });
      return created;
    });
    return NextResponse.json({ row: toDto(row) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Référence fiscale déjà existante pour cette période ou base indisponible." }, { status: 409 });
  }
}
