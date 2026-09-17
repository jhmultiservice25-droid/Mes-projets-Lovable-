import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ctx = await requireApiPermission("dashboard:view");
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => ({})) as { dataset?: string; format?: string; rowCount?: number; scope?: string };
  const dataset = String(body.dataset || "registre").slice(0, 120);
  const format = String(body.format || "UNKNOWN").slice(0, 20);
  const rowCount = Math.max(0, Math.min(Number(body.rowCount || 0), 1_000_000));
  const scope = String(body.scope || "vue courante").slice(0, 240);
  const generatedAt = new Date().toISOString();

  try {
    await withTransaction(async (client) => {
      await writeAudit(client, {
        session: ctx.session,
        action: "DATA_EXPORT",
        entityType: dataset,
        legalReason: "Export de données autorisé dans le périmètre du rôle connecté",
        metadata: { format, rowCount, scope, generatedAt },
        request,
      });
    });
  } catch (error) {
    console.error("Export audit unavailable", error);
  }

  return NextResponse.json({
    generatedBy: ctx.session.name,
    communeName: ctx.session.communeName,
    generatedAt,
  });
}
