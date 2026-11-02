import { createHmac, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const scrypt = promisify(scryptCallback);
const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 8;

type LoginRow = {
  user_id: string;
  full_name: string;
  email: string;
  commune_id: string;
  official_name: string;
  province: string;
  role: string;
  password_hash: string | null;
};

function validPasswordHash(value: string | null): value is string {
  if (!value) return false;
  const parts = value.split("$");
  return parts.length === 3 && parts[0] === "scrypt" &&
    /^[a-f0-9]{32}$/i.test(parts[1]) && /^[a-f0-9]{128}$/i.test(parts[2]);
}

async function verifyPassword(password: string, encoded: string) {
  if (!validPasswordHash(encoded)) return false;
  const [, salt, expectedHex] = encoded.split("$");
  const actual = await scrypt(password, Buffer.from(salt, "hex"), 64) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function rateKey(email: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET absent ou trop court.");
  return createHmac("sha256", secret).update(email).digest("hex");
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" &&
      (process.env.DEMO_MODE === "true" || !process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
    return NextResponse.json({ error: "Authentification de production non configurée." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password || password.length > 1024) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
  }

  let key: string;
  try {
    key = rateKey(email);
    const limit = await query<{ attempts: number }>(
      `INSERT INTO login_rate_limits (identity_hash, window_started_at, attempts)
       VALUES ($1, now(), 1)
       ON CONFLICT (identity_hash) DO UPDATE SET
         attempts = CASE WHEN login_rate_limits.window_started_at < now() - ($2::int * interval '1 minute')
                         THEN 1 ELSE login_rate_limits.attempts + 1 END,
         window_started_at = CASE WHEN login_rate_limits.window_started_at < now() - ($2::int * interval '1 minute')
                                  THEN now() ELSE login_rate_limits.window_started_at END
       RETURNING attempts`,
      [key, WINDOW_MINUTES],
    );
    if (Number(limit.rows[0]?.attempts || 0) > MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, {
        status: 429, headers: { "Retry-After": String(WINDOW_MINUTES * 60) },
      });
    }
  } catch (error) {
    console.error("login rate limit unavailable", error);
    return NextResponse.json({ error: "Service de connexion temporairement indisponible." }, { status: 503 });
  }

  try {
    const result = await query<LoginRow>(
      `SELECT u.id::text AS user_id, u.full_name, u.email, u.commune_id::text,
              c.official_name, c.province, u.role::text, u.password_hash
       FROM users u JOIN communes c ON c.id = u.commune_id
       WHERE lower(u.email)= $1 AND u.active=TRUE
       LIMIT 1`,
      [email],
    );
    const user = result.rows[0];
    const authenticated = Boolean(user && user.password_hash &&
      await verifyPassword(password, user.password_hash));

    if (!authenticated || !user) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
      return NextResponse.json({ error: "Configuration de session invalide." }, { status: 503 });
    }

    await query("DELETE FROM login_rate_limits WHERE identity_hash=$1", [key]);
    const token = createSessionToken({
      userId: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role as import("@/lib/rbac").UserRole,
      communeId: user.commune_id,
      communeName: user.official_name,
      province: user.province,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60,
      path: "/",
    });
    return NextResponse.json({ ok: true, database: true });
  } catch (error) {
    console.error("login authentication error", error);
    return NextResponse.json({ error: "Connexion temporairement indisponible." }, { status: 503 });
  }
}
