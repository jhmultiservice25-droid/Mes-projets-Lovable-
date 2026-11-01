import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole, Permission } from "./rbac";
import { hasPermission } from "./rbac";

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
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body, key);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return parseSessionToken(store.get(SESSION_COOKIE)?.value);
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
