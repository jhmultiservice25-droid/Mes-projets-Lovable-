import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import type { UserRole, Permission } from "./rbac";
import { hasPermission, ROLE_LABELS } from "./rbac";

export const SESSION_COOKIE = "ecommune_session";

export type SessionUser = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  communeId: string;
  communeName: string;
  province: string;
  exp: number;
};

function secret() {
  const configured = process.env.AUTH_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "dev-only-e-commune-secret-change-me";
  return null;
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionUser, "exp">) {
  const key = secret();
  if (!key) throw new Error("AUTH_SECRET doit être configuré en production.");
  const full: SessionUser = { ...payload, exp: Date.now() + 8 * 60 * 60 * 1000 };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

function parseSessionToken(token?: string): SessionUser | null {
  if (!token) return null;
  const key = secret();
  if (!key) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;
  const expected = sign(body, key);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<SessionUser>;
    if (typeof payload.userId !== "string" || !payload.userId ||
        typeof payload.exp !== "number" || !Number.isFinite(payload.exp) ||
        payload.exp <= Date.now()) return null;
    return payload as SessionUser;
  } catch {
    return null;
  }
}

/**
 * A signed cookie proves integrity, not that the account is still authorized.
 * Reload the active account and its current role/commune on every session read.
 * This immediately revokes disabled users and applies role/tenant changes.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const tokenSession = parseSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!tokenSession) return null;

  try {
    const result = await query<{
      user_id: string;
      full_name: string;
      email: string;
      role: string;
      commune_id: string;
      official_name: string;
      province: string;
    }>(
      `SELECT u.id::text AS user_id, u.full_name, u.email, u.role::text AS role,
              u.commune_id::text AS commune_id, c.official_name, c.province
       FROM users u
       JOIN communes c ON c.id = u.commune_id
       WHERE u.id = $1 AND u.active = TRUE
       LIMIT 1`,
      [tokenSession.userId],
    );
    const user = result.rows[0];
    if (!user || !(user.role in ROLE_LABELS)) return null;
    return {
      userId: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role as UserRole,
      communeId: user.commune_id,
      communeName: user.official_name,
      province: user.province,
      exp: tokenSession.exp,
    };
  } catch (error) {
    // Fail closed: a database outage must never preserve stale authorization.
    console.error("session revalidation failed", error);
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  if (!hasPermission(session.role, permission)) redirect("/");
  return session;
}
