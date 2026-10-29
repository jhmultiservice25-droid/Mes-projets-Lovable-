import { createHash, createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { requireApiPermission } from "@/lib/api-security";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

const MAX_TEXT = 4000;
const allowedServices: Record<string, string> = {
  ETAT_CIVIL: "État civil", URBANISME: "Urbanisme et habitat", POPULATION: "Population et attestations",
  ASSAINISSEMENT: "Assainissement et environnement", DERCO: "Développement communautaire (DERCO)",
  AGRICULTURE: "Agriculture et marchés", SPORTS_LOISIRS: "Sports, jeunesse et loisirs", AUTRE: "Autre service communal",
};
const statusLabels: Record<string, string> = {
  RECEIVED: "Reçu",
  UNDER_REVIEW: "En cours d’examen",
  NEEDS_INFO: "Informations complémentaires requises",
  APPROVED: "Avis favorable",
  REJECTED: "Avis défavorable",
  COMPLETED: "Traité",
};

function text(value: unknown, max = MAX_TEXT) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function publicReference() {
  const date = new Date();
  const year = date.getFullYear();
  const suffix = randomBytes(5).toString("hex").toUpperCase();
  return `DOS-KSV-${year}-${suffix}`;
}

export async function GET() {
  const ctx = await requireApiPermission("complaints:write");
  if (!ctx.ok) return ctx.response;
  try {
    const result = await query<{
      id: string; reference: string; service_label: string; request_type: string;
      subject: string; description: string; requester_name: string; requester_email: string; requester_phone: string;
      status: string; created_at: string; updated_at: string; assigned_name: string | null;
    }>(
      `SELECT d.id::text, d.reference, d.service_label, d.request_type, d.subject,
              d.description, d.requester_name, d.requester_email, d.requester_phone, d.status,
              d.created_at::text, d.updated_at::text, u.full_name AS assigned_name
       FROM public_dossiers d
       LEFT JOIN users u ON u.id=d.assigned_to AND u.commune_id=d.commune_id
       WHERE d.commune_id=$1
       ORDER BY d.created_at DESC LIMIT 500`,
      [ctx.session.communeId],
    );
    return NextResponse.json({ rows: result.rows.map((row) => ({
      ...row, statusLabel: statusLabels[row.status] || row.status,
    })) });
  } catch (error) {
    console.error("public dossier list error", error);
    return NextResponse.json({ error: "Le registre des dossiers publics n’est pas initialisé. Appliquez la migration 006." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "Origine de la requête refusée." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
    }
  }
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  // Honeypot anti-robot: bots that fill this invisible field receive a generic success.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = forwarded || request.headers.get("x-real-ip")?.trim() || "";
  const rateSecret = process.env.AUTH_SECRET || (process.env.NODE_ENV !== "production" ? "ecommune-local-rate-limit-secret" : "");
  if (process.env.NODE_ENV === "production" && !rateSecret) {
    return NextResponse.json({ error: "Le service de dépôt n’est pas configuré pour la production." }, { status: 503 });
  }
  if (clientIp && rateSecret) {
    const ipHash = createHmac("sha256", rateSecret).update(clientIp).digest("hex");
    try {
      const rate = await query<{ hits: number }>(
        "INSERT INTO public_dossier_rate_limits (ip_hash, window_started_at, hits) " +
        "VALUES ($1, now(), 1) " +
        "ON CONFLICT (ip_hash) DO UPDATE SET " +
        "hits = CASE WHEN public_dossier_rate_limits.window_started_at < now() - interval '1 hour' THEN 1 ELSE public_dossier_rate_limits.hits + 1 END, " +
        "window_started_at = CASE WHEN public_dossier_rate_limits.window_started_at < now() - interval '1 hour' THEN now() ELSE public_dossier_rate_limits.window_started_at END " +
        "RETURNING hits", [ipHash],
      );
      if (Number(rate.rows[0]?.hits || 0) > 5) {
        return NextResponse.json({ error: "Trop de tentatives depuis cette connexion. Réessayez dans une heure." }, { status: 429 });
      }
    } catch (error) {
      console.error("public dossier rate limit error", error);
      return NextResponse.json({ error: "Le dépôt public n’est pas initialisé. Contactez l’administration." }, { status: 503 });
    }
  }
  const serviceCode = text(body.serviceCode, 40);
  const serviceLabel = allowedServices[serviceCode] || "";
  const requestType = text(body.requestType, 100);
  const subject = text(body.subject, 180);
  const description = text(body.description, 3000);
  const requesterName = text(body.requesterName, 120);
  const requesterEmail = text(body.requesterEmail, 180).toLowerCase();
  const requesterPhone = text(body.requesterPhone, 40);
  const consent = body.privacyConsent === true;

  if (!allowedServices[serviceCode] || !serviceLabel || !requestType || !subject ||
      description.length < 20 || !requesterName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail) ||
      requesterPhone.length < 6 || !consent) {
    return NextResponse.json({ error: "Vérifiez le service, le type de démarche, la description (20 caractères minimum), vos coordonnées et le consentement." }, { status: 400 });
  }
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > 12000) {
    return NextResponse.json({ error: "La demande dépasse la taille autorisée." }, { status: 413 });
  }

  const trackingToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(trackingToken);
  const reference = publicReference();
  try {
    const result = await withTransaction(async (client) => {
      const commune = await client.query<{ id: string }>(
        "SELECT id::text FROM communes WHERE code='KIN-KSV' LIMIT 1",
      );
      if (!commune.rows[0]) throw new Error("COMMUNE_NOT_CONFIGURED");
      const created = await client.query<{ id: string; created_at: string }>(
        `INSERT INTO public_dossiers
          (commune_id, reference, tracking_token_hash, service_code, service_label, request_type,
           subject, description, requester_name, requester_email, requester_phone, privacy_consent_at, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now(),'RECEIVED')
         RETURNING id::text, created_at::text`,
        [commune.rows[0].id, reference, tokenHash, serviceCode, serviceLabel, requestType,
          subject, description, requesterName, requesterEmail, requesterPhone],
      );
      await client.query(
        `INSERT INTO public_dossier_events
          (commune_id,dossier_id,event_type,to_status,message,visible_to_citizen)
         VALUES ($1,$2,'SUBMITTED','RECEIVED','Votre demande a été reçue par le portail. Elle doit encore être examinée par le service compétent.',TRUE)`,
        [commune.rows[0].id, created.rows[0].id],
      );
      return created.rows[0];
    });
    return NextResponse.json({
      ok: true,
      dossier: { reference, trackingToken, createdAt: result.created_at, status: "RECEIVED", statusLabel: statusLabels.RECEIVED },
      message: "Conservez la référence et le code de suivi. Le code ne pourra pas être récupéré si vous le perdez.",
    }, { status: 201 });
  } catch (error) {
    console.error("public dossier create error", error);
    return NextResponse.json({ error: "Le dépôt est temporairement indisponible. Réessayez plus tard ou contactez le guichet communal." }, { status: 503 });
  }
}
