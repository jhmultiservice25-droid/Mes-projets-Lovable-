import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requireApiPermission("business:write");
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { result?: string; observations?: string };
  const resultText = String(body.result || "Contrôle de routine").trim();
  try {
    const inspection = await withTransaction(async (client) => {
      const stall = await client.query<{id:string}>(`SELECT id::text FROM market_stalls WHERE id=$1 AND commune_id=$2 FOR UPDATE`, [id, ctx.session.communeId]);
      if (!stall.rows[0]) throw new Error("NOT_FOUND");
      const inserted = await client.query<{id:string; inspected_at:string}>(
        `INSERT INTO market_stall_inspections (commune_id, stall_id, inspected_by, result, observations)
         VALUES ($1,$2,$3,$4,$5) RETURNING id::text, inspected_at::text`,
        [ctx.session.communeId, id, ctx.session.userId, resultText, String(body.observations || "")],
      );
      await client.query(`UPDATE market_stalls SET last_inspection_at=now(), updated_at=now() WHERE id=$1`, [id]);
      await writeAudit(client, {
        session: ctx.session,
        action: "MARKET_STALL_INSPECTION_CREATE",
        entityType: "market_stall_inspection",
        entityId: inserted.rows[0].id,
        afterData: { stallId: id, result: resultText, observations: body.observations || "", inspectedAt: inserted.rows[0].inspected_at },
        request,
      });
      return inserted.rows[0];
    });
    return NextResponse.json({ ok: true, inspection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "NOT_FOUND" ? "Étalage introuvable." : "Inspection non enregistrée." }, { status: 404 });
  }
}
