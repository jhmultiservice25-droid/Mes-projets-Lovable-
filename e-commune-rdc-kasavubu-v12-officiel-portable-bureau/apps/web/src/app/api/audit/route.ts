import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type AuditRow={id:string;action:string;entity_type:string|null;entity_id:string|null;user_name:string|null;user_email:string|null;legal_reason:string|null;metadata:Record<string,unknown>;created_at:string};

export async function GET(request:Request){
  const ctx=await requireApiPermission("audit:view"); if(!ctx.ok)return ctx.response;
  const url=new URL(request.url); const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||100),1),500);
  try{
    const result=await query<AuditRow>(`SELECT a.id::text,a.action,a.entity_type,a.entity_id,u.full_name AS user_name,u.email AS user_email,a.legal_reason,a.metadata,a.created_at::text FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id WHERE a.commune_id=$1 ORDER BY a.created_at DESC LIMIT $2`,[ctx.session.communeId,limit]);
    return NextResponse.json({rows:result.rows});
  }catch(error){console.error(error);return NextResponse.json({error:"Journal d'audit indisponible."},{status:503});}
}
