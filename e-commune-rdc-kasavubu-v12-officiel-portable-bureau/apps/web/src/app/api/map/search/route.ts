import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Session requise." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") || "").trim();
  if (raw.length < 3) return NextResponse.json({ results: [] });

  const query = `${raw}, ${session.communeName}, ${session.province}, République démocratique du Congo`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "e-Commune-RDC/0.2 (administration territoriale)" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Nominatim indisponible");
    const data = await response.json();
    const results = data.map((item: { display_name: string; lat: string; lon: string; boundingbox?: string[] }) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
      boundingbox: item.boundingbox,
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], warning: "Service cartographique temporairement indisponible." }, { status: 200 });
  }
}
