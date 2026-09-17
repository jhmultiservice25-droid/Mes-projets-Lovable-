import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "./auth";
import { hasPermission, type Permission } from "./rbac";

export type ApiContext = { ok: true; session: SessionUser } | { ok: false; response: NextResponse };

export async function requireApiPermission(permission?: Permission): Promise<ApiContext> {
  const session = await getSession();
  if (!session) return { ok: false, response: NextResponse.json({ error: "Session requise." }, { status: 401 }) };
  if (permission && !hasPermission(session.role, permission)) {
    return { ok: false, response: NextResponse.json({ error: "Accès refusé pour ce rôle." }, { status: 403 }) };
  }
  return { ok: true, session };
}
