import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { query, withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";
const allowedStatuses = new Set(["UNDER_REVIEW", "NEEDS_INFO", "APPROVED", "REJECTED", "COMPLETED"]);
const labels: Record<string, string> = {
  RECEIVED: "Reçu",
  UNDER_REVIEW: "En cours d’examen",
  NEEDS_INFO: "Informations complémentaires requises",
  APPROVED: "Avis favorable",
  REJECTED: "Avis défavorable",
  COMPLETED: "Traité",
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requireApiPermission("complaints:write");
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Identifiant de dossier invalide." }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { status?: string; publicMessage?: string; internalNote?: string };
  const status = typeof body.status === "string" ? body.status : "";
  const publicMessage = typeof body.publicMessage === "string" ? body.publicMessage.trim().slice(0, 1000) : "";
  const internalNote = typeof body.internalNote === "string" ? body.internalNote.trim().slice(0, 2000) : "";
  if (!allowedStatuses.has(status)) return NextResponse.json({ error: "Statut de traitement non autorisé." }, { status: 400 });
  if (status === "NEEDS_INFO" && publicMessage.length < 5) return NextResponse.json({ error: "Un message visible au citoyen est requis pour demander des informations complémentaires." }, { status: 400 });

  try {
    const updated = await withTransaction(async (client) => {
      const current = await client.query<{ id: string; reference: string; status: string; subject: string; domain_entity_type: string | null; domain_entity_id: string | null }>(
        "SELECT id::text, reference, status, subject, domain_entity_type, domain_entity_id::text FROM public_dossiers WHERE id=$1 AND commune_id=$2 FOR UPDATE",
        [id, ctx.session.communeId],
      );
      const row = current.rows[0];
      if (!row) return null;
      const nextStatus = status;
      const updatedResult = await client.query<{ id: string; reference: string; status: string; updated_at: string }>(
        `UPDATE public_dossiers SET status=$3, updated_at=now(),
          closed_at=CASE WHEN $3 IN ('COMPLETED','REJECTED','APPROVED') THEN now() ELSE NULL END
         WHERE id=$1 AND commune_id=$2
         RETURNING id::text, reference, status, updated_at::text`,
        [id, ctx.session.communeId, nextStatus],
      );
      if (row.domain_entity_type && row.domain_entity_id) {
        if (row.domain_entity_type === "civil_registry_case") {
          const domainStatus = nextStatus === "UNDER_REVIEW" ? "IN_REVIEW"
            : nextStatus === "NEEDS_INFO" ? "NEEDS_INFO"
            : nextStatus === "APPROVED" ? "READY_FOR_VALIDATION" : nextStatus;
          await client.query(
            "UPDATE civil_registry_cases SET status=$3 WHERE id=$1 AND commune_id=$2",
            [row.domain_entity_id, ctx.session.communeId, domainStatus],
          );
        } else if (row.domain_entity_type === "urbanism_case") {
          const domainStatus = nextStatus === "UNDER_REVIEW" ? "IN_REVIEW"
            : nextStatus === "NEEDS_INFO" ? "NEEDS_INFO"
            : nextStatus === "APPROVED" ? "READY_FOR_VALIDATION" : nextStatus;
          await client.query(
            "UPDATE urbanism_cases SET status=$3 WHERE id=$1 AND commune_id=$2",
            [row.domain_entity_id, ctx.session.communeId, domainStatus],
          );
        } else if (row.domain_entity_type === "complaint") {
          const domainStatus = nextStatus === "COMPLETED" ? "RESOLVED"
            : nextStatus === "REJECTED" ? "CLOSED"
            : nextStatus === "RECEIVED" ? "OPEN" : "IN_PROGRESS";
          await client.query(
            "UPDATE complaints SET status=$3, closed_at=CASE WHEN $3 IN ('RESOLVED','CLOSED') THEN now() ELSE NULL END WHERE id=$1 AND commune_id=$2",
            [row.domain_entity_id, ctx.session.communeId, domainStatus],
          );
        }
      }
      const eventMessage = publicMessage || (internalNote ? "Mise à jour interne du dossier." : `Le statut du dossier a été mis à jour : ${labels[nextStatus]}.`);
      await client.query(
        `INSERT INTO public_dossier_events
          (commune_id,dossier_id,actor_user_id,event_type,from_status,to_status,message,visible_to_citizen)
         VALUES ($1,$2,$3,'STATUS_UPDATED',$4,$5,$6,$7)`,
        [ctx.session.communeId, id, ctx.session.userId, row.status, nextStatus, eventMessage, Boolean(publicMessage)],
      );
      await writeAudit(client, {
        session: ctx.session,
        action: "PUBLIC_DOSSIER_STATUS_UPDATE",
        entityType: "public_dossier",
        entityId: id,
        beforeData: { reference: row.reference, status: row.status },
        afterData: { reference: row.reference, status: nextStatus },
        metadata: { publicMessageAdded: Boolean(publicMessage), internalNotePresent: Boolean(internalNote), internalNote },
        request,
      });
      return updatedResult.rows[0];
    });
    if (!updated) return NextResponse.json({ error: "Dossier introuvable dans cette commune." }, { status: 404 });
    return NextResponse.json({ ok: true, dossier: { ...updated, statusLabel: labels[updated.status] || updated.status } });
  } catch (error) {
    console.error("public dossier update error", error);
    return NextResponse.json({ error: "La mise à jour du dossier a échoué." }, { status: 503 });
  }
}
