import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const labels: Record<string, string> = {
  RECEIVED: "Reçu",
  UNDER_REVIEW: "En cours d’examen",
  NEEDS_INFO: "Informations complémentaires requises",
  APPROVED: "Avis favorable",
  REJECTED: "Avis défavorable",
  COMPLETED: "Traité",
};

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { reference?: string; trackingToken?: string };
  const reference = typeof body.reference === "string" ? body.reference.trim().toUpperCase().slice(0, 60) : "";
  const trackingToken = typeof body.trackingToken === "string" ? body.trackingToken.trim().slice(0, 120) : "";
  if (!/^DOS-KSV-\d{4}-[A-F0-9]{10}$/.test(reference) || trackingToken.length < 30 || trackingToken.length > 100) {
    return NextResponse.json({ error: "Référence ou code de suivi invalide." }, { status: 400 });
  }
  const tokenHash = createHash("sha256").update(trackingToken).digest("hex");
  try {
    const result = await query<{
      id: string; reference: string; service_label: string; request_type: string; subject: string;
      status: string; created_at: string; updated_at: string;
    }>(
      `SELECT id::text, reference, service_label, request_type, subject, status, created_at::text, updated_at::text
       FROM public_dossiers WHERE reference=$1 AND tracking_token_hash=$2 LIMIT 1`,
      [reference, tokenHash],
    );
    const dossier = result.rows[0];
    if (!dossier) return NextResponse.json({ error: "Dossier introuvable ou code de suivi incorrect." }, { status: 404 });
    const events = await query<{ event_type: string; from_status: string | null; to_status: string | null; message: string; created_at: string }>(
      `SELECT event_type, from_status, to_status, message, created_at::text
       FROM public_dossier_events
       WHERE dossier_id=$1 AND visible_to_citizen=TRUE
       ORDER BY created_at ASC LIMIT 100`,
      [dossier.id],
    );
    return NextResponse.json({
      dossier: { ...dossier, statusLabel: labels[dossier.status] || dossier.status },
      events: events.rows.map((event) => ({ ...event, statusLabel: event.to_status ? labels[event.to_status] || event.to_status : null })),
    });
  } catch (error) {
    console.error("public dossier tracking error", error);
    return NextResponse.json({ error: "Le suivi des dossiers n’est pas initialisé ou temporairement indisponible." }, { status: 503 });
  }
}
