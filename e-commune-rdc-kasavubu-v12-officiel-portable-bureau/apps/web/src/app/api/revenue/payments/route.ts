import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api-security";
import { query, withTransaction } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

type PaymentRow = {
  id: string;
  reference: string;
  taxpayer: string;
  taxpayer_ref: string | null;
  tax_code: string;
  tax_label: string;
  amount: string;
  channel: string;
  external_ref: string | null;
  receipt: string;
  verification_token: string;
  status: string;
  date: string;
};

function channelFromUi(input: string) {
  const value = input.toLowerCase();
  if (value.includes("mobile")) return "MOBILE_MONEY";
  if (value.includes("banque") || value.includes("bank")) return "BANK";
  if (value.includes("caisse") || value.includes("cash")) return "CASH";
  return "OTHER";
}
function channelToUi(input: string) {
  return input === "MOBILE_MONEY" ? "Mobile Money" : input === "BANK" ? "Banque" : input === "CASH" ? "Caisse" : "Autre";
}
function toDto(row: PaymentRow) {
  return {
    id: row.id,
    reference: row.reference,
    taxpayer: row.taxpayer,
    taxpayerRef: row.taxpayer_ref || "",
    taxCode: row.tax_code,
    taxLabel: row.tax_label,
    amount: Number(row.amount),
    channel: channelToUi(row.channel),
    externalRef: row.external_ref || "",
    receipt: row.receipt,
    verificationToken: row.verification_token,
    status: row.status === "RECONCILED" ? "RECONCILED" : "PENDING",
    date: row.date,
  };
}

const listSql = `
  SELECT p.id::text, ri.reference, ri.taxpayer_name AS taxpayer, ri.taxpayer_reference AS taxpayer_ref,
         fc.code AS tax_code, fc.label AS tax_label, p.amount_cdf::text AS amount,
         p.channel, p.external_reference AS external_ref, rr.receipt_number AS receipt,
         rr.verification_token, p.reconciliation_status AS status, p.received_at::text AS date
  FROM revenue_payments p
  JOIN revenue_items ri ON ri.id=p.revenue_item_id
  JOIN fiscal_catalog fc ON fc.id=ri.fiscal_catalog_id
  JOIN revenue_receipts rr ON rr.payment_id=p.id
  WHERE p.commune_id=$1 AND rr.cancelled_at IS NULL
  ORDER BY p.received_at DESC`;

export async function GET() {
  const ctx = await requireApiPermission("revenue:view");
  if (!ctx.ok) return ctx.response;
  try {
    const result = await query<PaymentRow>(listSql, [ctx.session.communeId]);
    return NextResponse.json({ rows: result.rows.map(toDto) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de charger les perceptions." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const ctx = await requireApiPermission("revenue:write");
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => ({})) as {
    taxpayer?: string; taxpayerRef?: string; taxCode?: string; amount?: number; channel?: string; externalRef?: string;
  };
  const taxpayer = String(body.taxpayer || "").trim();
  const taxpayerRef = String(body.taxpayerRef || "").trim();
  const taxCode = String(body.taxCode || "").trim();
  const amount = Number(body.amount || 0);
  const channel = channelFromUi(String(body.channel || ""));
  const externalRef = String(body.externalRef || "").trim();
  if (!taxpayer || !taxCode || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Contribuable, référence fiscale et montant positif sont requis." }, { status: 400 });
  }

  try {
    const dto = await withTransaction(async (client) => {
      const taxResult = await client.query<{id:string; code:string; label:string}>(
        `SELECT id::text, code, label FROM fiscal_catalog
         WHERE commune_id=$1 AND code=$2 AND active=TRUE
           AND valid_from<=current_date AND (valid_until IS NULL OR valid_until>=current_date)
         ORDER BY valid_from DESC LIMIT 1`,
        [ctx.session.communeId, taxCode],
      );
      const tax = taxResult.rows[0];
      if (!tax) throw new Error("FISCAL_REFERENCE_INACTIVE");

      const suffix = `${Date.now().toString().slice(-8)}${randomBytes(2).toString("hex").toUpperCase()}`;
      const liquidationRef = `LIQ-KSV-${suffix}`;
      const paymentRef = `PAY-KSV-${suffix}`;
      const receiptNumber = `KSV-${new Date().getFullYear()}-${suffix}`;
      const verificationToken = randomBytes(12).toString("hex").toUpperCase();

      const revenue = await client.query<{id:string}>(
        `INSERT INTO revenue_items
          (commune_id, fiscal_catalog_id, reference, taxpayer_name, taxpayer_reference, amount_cdf, status,
           payment_channel, external_payment_reference, issued_by, paid_at, receipt_number)
         VALUES ($1,$2,$3,$4,$5,$6,'PAID',$7,$8,$9,now(),$10)
         RETURNING id::text`,
        [ctx.session.communeId, tax.id, liquidationRef, taxpayer, taxpayerRef || null, amount, channel, externalRef || null, ctx.session.userId, receiptNumber],
      );
      const payment = await client.query<{id:string}>(
        `INSERT INTO revenue_payments
          (commune_id, revenue_item_id, payment_reference, channel, amount_cdf, external_reference, received_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id::text`,
        [ctx.session.communeId, revenue.rows[0].id, paymentRef, channel, amount, externalRef || null, ctx.session.userId],
      );
      await client.query(
        `INSERT INTO revenue_receipts (commune_id, payment_id, receipt_number, verification_token)
         VALUES ($1,$2,$3,$4)`,
        [ctx.session.communeId, payment.rows[0].id, receiptNumber, verificationToken],
      );

      if (taxpayerRef) {
        await client.query(
          `UPDATE market_stalls SET payment_status='CURRENT', updated_at=now()
           WHERE commune_id=$1 AND stall_code=$2`,
          [ctx.session.communeId, taxpayerRef],
        );
      }

      const result = await client.query<PaymentRow>(`${listSql.replace("ORDER BY p.received_at DESC", "AND p.id=$2 ORDER BY p.received_at DESC")}`, [ctx.session.communeId, payment.rows[0].id]);
      const created = toDto(result.rows[0]);
      await writeAudit(client, {
        session: ctx.session,
        action: "REVENUE_PAYMENT_CREATE",
        entityType: "revenue_payment",
        entityId: payment.rows[0].id,
        legalReason: `Référence fiscale ${tax.code}`,
        afterData: created,
        metadata: { receiptNumber, paymentReference: paymentRef },
        request,
      });
      return created;
    });
    return NextResponse.json({ row: dto }, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error && error.message === "FISCAL_REFERENCE_INACTIVE"
      ? "Référence fiscale absente, inactive ou hors période de validité."
      : "Perception non enregistrée. Vérifiez notamment la référence de transaction pour éviter un doublon.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
