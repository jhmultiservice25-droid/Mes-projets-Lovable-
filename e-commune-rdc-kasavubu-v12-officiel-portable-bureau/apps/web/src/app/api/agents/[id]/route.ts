import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { canCreateAgents, type UserRole } from "@/lib/rbac";
import { withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

const assignable: UserRole[] = [
  "BOURGMESTRE_ADJOINT", "SECRETAIRE_COMMUNAL", "CHEF_SERVICE", "ETAT_CIVIL",
  "REGIE_RECETTES", "MARCHES", "CAISSIER", "URBANISME", "SANTE_HYGIENE", "CHEF_QUARTIER", "AGENT", "AUDITEUR",
];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await requireApiPermission("personnel:view");
  if (!ctx.ok) return ctx.response;
  if (!canCreateAgents(ctx.session.role)) return NextResponse.json({ error: "Seul le Bourgmestre gère les habilitations." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { role?: UserRole; active?: boolean };
  if (body.role && !assignable.includes(body.role)) return NextResponse.json({ error: "Rôle non attribuable." }, { status: 400 });
  if (id === ctx.session.userId) return NextResponse.json({ error: "Le compte Bourgmestre connecté ne peut pas se suspendre ou s'attribuer un rôle agent." }, { status: 400 });

  try {
    const result = await withTransaction(async (client) => {
      const before = await client.query(`SELECT id::text, full_name, email, role, active FROM users WHERE id=$1 AND commune_id=$2 FOR UPDATE`, [id,ctx.session.communeId]);
      if(!before.rows[0]) throw new Error("NOT_FOUND");
      if(before.rows[0].role === "BOURGMESTRE") throw new Error("BOURGMESTRE_PROTECTED");
      await client.query(`UPDATE users SET role=COALESCE($3::user_role,role), active=COALESCE($4,active), disabled_at=CASE WHEN $4=FALSE THEN now() WHEN $4=TRUE THEN NULL ELSE disabled_at END WHERE id=$1 AND commune_id=$2`,[id,ctx.session.communeId,body.role||null,typeof body.active==="boolean"?body.active:null]);
      const after = await client.query(`SELECT id::text, full_name, email, role, active FROM users WHERE id=$1`,[id]);
      await writeAudit(client,{session:ctx.session,action:"AGENT_ACCOUNT_UPDATE",entityType:"user",entityId:id,beforeData:before.rows[0],afterData:after.rows[0],request});
      return after.rows[0];
    });
    return NextResponse.json({ok:true,row:result});
  } catch(error) {
    const message=error instanceof Error&&error.message==="NOT_FOUND"?"Agent introuvable.":error instanceof Error&&error.message==="BOURGMESTRE_PROTECTED"?"Le compte Bourgmestre est protégé.":"Mise à jour impossible.";
    return NextResponse.json({error:message},{status:404});
  }
}
