import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { canCreateAgents, type UserRole } from "@/lib/rbac";
import { query, withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

const allowedRoles: UserRole[] = [
  "BOURGMESTRE_ADJOINT", "SECRETAIRE_COMMUNAL", "CHEF_SERVICE", "ETAT_CIVIL",
  "REGIE_RECETTES", "MARCHES", "CAISSIER", "URBANISME", "SANTE_HYGIENE", "CHEF_QUARTIER", "AGENT", "AUDITEUR",
];

type AgentRow = { id:string; name:string; email:string; service:string|null; role:UserRole; employee_ref:string|null; legal_act_ref:string|null; active:boolean; created_at:string };

function toDto(row: AgentRow) { return { id:row.id, name:row.name, email:row.email, service:row.service||"", role:row.role, employeeRef:row.employee_ref||"", legalActRef:row.legal_act_ref||"", active:row.active, createdAt:row.created_at }; }

export async function GET() {
  const ctx = await requireApiPermission("personnel:view");
  if (!ctx.ok) return ctx.response;
  try {
    const result = await query<AgentRow>(
      `SELECT id::text, full_name AS name, email, service_name AS service, role,
              employee_reference AS employee_ref, legal_act_reference AS legal_act_ref,
              active, created_at::text
       FROM users WHERE commune_id=$1 ORDER BY (role='BOURGMESTRE') DESC, full_name ASC`,
      [ctx.session.communeId],
    );
    return NextResponse.json({ rows: result.rows.map(toDto) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de charger l'annuaire des agents." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const ctx = await requireApiPermission("personnel:view");
  if (!ctx.ok) return ctx.response;
  if (!canCreateAgents(ctx.session.role)) return NextResponse.json({ error: "Seul le Bourgmestre peut créer un compte agent dans sa commune." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { name?: string; email?: string; service?: string; role?: UserRole; legalActRef?: string; employeeRef?: string };
  if (!body.name || !body.email || !body.service || !body.role || !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Données agent incomplètes ou rôle non autorisé." }, { status: 400 });
  }
  try {
    const agent = await withTransaction(async (client) => {
      const result = await client.query<AgentRow>(
        `INSERT INTO users
          (commune_id,email,full_name,role,service_name,employee_reference,legal_act_reference,password_hash,mfa_required,active,created_by)
         VALUES ($1,lower($2),$3,$4,$5,$6,$7,NULL,TRUE,FALSE,$8)
         RETURNING id::text, full_name AS name, email, service_name AS service, role,
                   employee_reference AS employee_ref, legal_act_reference AS legal_act_ref, active, created_at::text`,
        [ctx.session.communeId, body.email.trim(), body.name.trim(), body.role, body.service.trim(), body.employeeRef?.trim()||null, body.legalActRef?.trim()||null, ctx.session.userId],
      );
      const dto=toDto(result.rows[0]);
      await writeAudit(client,{session:ctx.session,action:"AGENT_ACCOUNT_CREATE",entityType:"user",entityId:dto.id,legalReason:body.legalActRef||undefined,afterData:dto,request});
      return dto;
    });
    return NextResponse.json({ ok:true, agent, warning:"Compte créé en état inactif. Le Bourgmestre doit l'activer après contrôle de l'affectation et de l'identité." }, { status:201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error:"Compte non créé. Vérifiez notamment l'unicité de l'adresse e-mail dans la commune." }, { status:409 });
  }
}
