import type { PoolClient } from "pg";
import type { SessionUser } from "./auth";

type AuditInput = {
  session: SessionUser;
  action: string;
  entityType?: string;
  entityId?: string;
  legalReason?: string;
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: Record<string, unknown>;
  request?: Request;
};

function ipFrom(request?: Request) {
  if (!request) return null;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  const candidate = forwarded || real || null;
  return candidate && /^[0-9a-fA-F:.]+$/.test(candidate) ? candidate : null;
}

export async function writeAudit(client: PoolClient, input: AuditInput) {
  await client.query(
    `INSERT INTO audit_logs
      (commune_id, user_id, action, entity_type, entity_id, ip_address, user_agent, legal_reason, before_data, after_data, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb)`,
    [
      input.session.communeId,
      input.session.userId,
      input.action,
      input.entityType || null,
      input.entityId || null,
      ipFrom(input.request),
      input.request?.headers.get("user-agent") || null,
      input.legalReason || null,
      input.beforeData == null ? null : JSON.stringify(input.beforeData),
      input.afterData == null ? null : JSON.stringify(input.afterData),
      JSON.stringify(input.metadata || {}),
    ],
  );
}
