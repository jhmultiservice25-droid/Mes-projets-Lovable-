import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { expires: new Date(0), path: "/" });
  return NextResponse.json({ ok: true });
}
