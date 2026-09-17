import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type LoginRow = {
  user_id: string;
  full_name: string;
  email: string;
  commune_id: string;
  official_name: string;
  province: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const demoEnabled = process.env.DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
  const email = process.env.DEMO_BOURGMESTRE_EMAIL || "bourgmestre@demo.ecommune.cd";
  const password = process.env.DEMO_BOURGMESTRE_PASSWORD || "Ecommune-2026!";
  const communeCode = process.env.DEMO_COMMUNE_CODE || "KIN-KSV";

  if (!demoEnabled || body.email?.toLowerCase() !== email.toLowerCase() || body.password !== password) {
    return NextResponse.json({ error: "Identifiants invalides ou authentification non configurée." }, { status: 401 });
  }

  const allowDatabaseFallback = process.env.DEMO_DB_FALLBACK === "true" && demoEnabled;

  let sessionUser: {
    userId: string;
    name: string;
    email: string;
    communeId: string;
    communeName: string;
    province: string;
  } | null = null;

  const databaseUrl = process.env.DATABASE_URL || "";
  const databaseLooksConfigured = Boolean(databaseUrl) && !databaseUrl.includes("CHANGE_ME");

  if (databaseLooksConfigured) {
    try {
      const result = await query<LoginRow>(
        `SELECT u.id::text AS user_id, u.full_name, u.email, c.id::text AS commune_id, c.official_name, c.province
         FROM users u JOIN communes c ON c.id = u.commune_id
         WHERE lower(u.email)=lower($1) AND u.role='BOURGMESTRE' AND u.active=TRUE AND c.code=$2
         LIMIT 1`,
        [email, communeCode],
      );
      const row = result.rows[0];
      if (row) {
        sessionUser = {
          userId: row.user_id,
          name: row.full_name,
          email: row.email,
          communeId: row.commune_id,
          communeName: row.official_name,
          province: row.province,
        };
      } else if (!allowDatabaseFallback) {
        return NextResponse.json({ error: "Compte Bourgmestre pilote absent. Initialisez PostgreSQL avec CONFIGURER-POSTGRESQL.bat." }, { status: 503 });
      }
    } catch (error) {
      console.error("login database error", error);
      if (!allowDatabaseFallback) {
        return NextResponse.json({ error: "Base PostgreSQL indisponible ou non initialisée." }, { status: 503 });
      }
    }
  }

  if (!sessionUser && allowDatabaseFallback) {
    sessionUser = {
      userId: "00000000-0000-4000-8000-000000000001",
      name: "Bourgmestre — mode démonstration Kasa-Vubu",
      email,
      communeId: "00000000-0000-4000-8000-000000000002",
      communeName: process.env.DEMO_COMMUNE_NAME || "Commune de Kasa-Vubu",
      province: process.env.DEMO_PROVINCE || "Kinshasa",
    };
  }

  if (!sessionUser) {
    return NextResponse.json({ error: "PostgreSQL doit être configuré pour poursuivre." }, { status: 503 });
  }

  const token = createSessionToken({
    ...sessionUser,
    role: "BOURGMESTRE",
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
    path: "/",
  });
  return NextResponse.json({ ok: true, database: databaseLooksConfigured && sessionUser.userId !== "00000000-0000-4000-8000-000000000001" });
}
