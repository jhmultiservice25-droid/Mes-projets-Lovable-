import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import type { HealthFacility } from "@/lib/pilot-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Session requise." }, { status: 401 });
  if (!hasPermission(session.role, "health:write")) return NextResponse.json({ error: "Votre rôle n'est pas habilité à modifier le registre sanitaire." }, { status: 403 });

  const body = await request.json().catch(() => ({})) as Record<string, string | undefined>;
  if (!body.name || !body.type || !body.communalActRef) {
    return NextResponse.json({ error: "Nom, type et référence de l'acte communal sont requis." }, { status: 400 });
  }
  if (body.status === "En activité" && !body.healthAuthorizationRef) {
    return NextResponse.json({ error: "Une structure ne peut pas être marquée en activité sans référence d'autorisation/agrément sanitaire." }, { status: 400 });
  }

  const facility: HealthFacility = {
    id: `SAN-KSV-C-${Date.now().toString().slice(-6)}`,
    name: body.name,
    type: body.type,
    ownership: "Commune",
    origin: "Créée par la commune",
    status: body.status === "En activité" ? "En activité" : body.status === "À vérifier" ? "À vérifier" : "Projet",
    quartier: body.quartier || undefined,
    address: body.address || undefined,
    services: (body.services || "").split(",").map((value) => value.trim()).filter(Boolean),
    source: `Saisie e-Commune par ${session.name} — validation documentaire requise`,
    sourceStatus: "Source sectorielle",
    communalActRef: body.communalActRef,
    healthAuthorizationRef: body.healthAuthorizationRef || undefined,
    projectId: body.projectId || undefined,
  };

  return NextResponse.json({
    ok: true,
    facility,
    communeId: session.communeId,
    warning: "Prototype : la création est validée côté serveur mais doit être persistée dans PostgreSQL avant usage réel.",
  }, { status: 201 });
}
