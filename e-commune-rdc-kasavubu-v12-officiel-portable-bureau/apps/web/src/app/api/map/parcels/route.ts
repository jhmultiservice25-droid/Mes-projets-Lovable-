import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Session requise." }, { status: 401 });
  return NextResponse.json({
    geojson: { type: "FeatureCollection", features: [] },
    count: 0,
    validationStatus: "NO_OFFICIAL_DATA_LOADED",
    note: "Aucune géométrie parcellaire n'est fournie par défaut. Charger un référentiel officiel validé avant affichage.",
  });
}
