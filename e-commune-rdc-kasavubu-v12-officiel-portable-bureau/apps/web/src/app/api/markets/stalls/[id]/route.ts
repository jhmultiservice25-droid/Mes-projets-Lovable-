import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requireApiPermission("business:write");
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { status?: string; payment?: string; note?: string };
  const statusMap: Record<string,string> = { OCCUPE: "OCCUPIED", LIBRE: "FREE", SUSPENDU: "SUSPENDED" };
  const paymentMap: Record<string,string> = { A_JOUR: "CURRENT", A_PAYER: "DUE", RETARD: "LATE" };

  try {
    const row = await withTransaction(async (client) => {
      const before = await client.query(`SELECT id::text, occupancy_status, payment_status, notes FROM market_stalls WHERE id=$1 AND commune_id=$2 FOR UPDATE`, [id, ctx.session.communeId]);
      if (!before.rows[0]) throw new Error("NOT_FOUND");
      const nextStatus = body.status ? statusMap[body.status] : null;
      const nextPayment = body.payment ? paymentMap[body.payment] : null;
      await client.query(
        `UPDATE market_stalls SET
           occupancy_status=COALESCE($3,occupancy_status),
           payment_status=COALESCE($4,payment_status),
           notes=COALESCE($5,notes), updated_at=now()
         WHERE id=$1 AND commune_id=$2`,
        [id, ctx.session.communeId, nextStatus, nextPayment, body.note ?? null],
      );
      const after = await client.query(`SELECT id::text, occupancy_status, payment_status, notes FROM market_stalls WHERE id=$1`, [id]);
      await writeAudit(client, {
        session: ctx.session,
        action: "MARKET_STALL_UPDATE",
        entityType: "market_stall",
        entityId: id,
        beforeData: before.rows[0],
        afterData: after.rows[0],
        request,
      });
      return after.rows[0];
    });
    return NextResponse.json({ ok: true, row });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "NOT_FOUND" ? "Étalage introuvable." : "Mise à jour impossible." }, { status: 404 });
  }
}
