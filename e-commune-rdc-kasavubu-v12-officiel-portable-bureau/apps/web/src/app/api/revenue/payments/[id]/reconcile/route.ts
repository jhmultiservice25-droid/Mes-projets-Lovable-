import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requireApiPermission("revenue:write");
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;
  try {
    await withTransaction(async (client) => {
      const before = await client.query(
        `SELECT id::text, reconciliation_status, reconciled_at::text FROM revenue_payments WHERE id=$1 AND commune_id=$2 FOR UPDATE`,
        [id, ctx.session.communeId],
      );
      if (!before.rows[0]) throw new Error("NOT_FOUND");
      await client.query(
        `UPDATE revenue_payments SET reconciliation_status='RECONCILED', reconciled_by=$3, reconciled_at=now()
         WHERE id=$1 AND commune_id=$2`,
        [id, ctx.session.communeId, ctx.session.userId],
      );
      await writeAudit(client, {
        session: ctx.session,
        action: "REVENUE_PAYMENT_RECONCILE",
        entityType: "revenue_payment",
        entityId: id,
        beforeData: before.rows[0],
        afterData: { reconciliation_status: "RECONCILED", reconciled_by: ctx.session.userId },
        request,
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "NOT_FOUND" ? "Paiement introuvable." : "Rapprochement impossible." }, { status: 404 });
  }
}
