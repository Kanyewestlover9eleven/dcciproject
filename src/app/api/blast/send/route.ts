import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereFromFilters, type FilterInput } from "@/lib/contractorFilters";
const prisma = new PrismaClient();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!; // set this in .env

export async function POST(req: Request) {
  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json({ error: "N8N_WEBHOOK_URL not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { audienceId, templateId, channels, filters: rawFilters, subject, emailBody, waBody } = body;

  // resolve audience & template if IDs provided
  let filters: FilterInput | undefined = rawFilters;
  if (audienceId) {
    const a = await prisma.audience.findUnique({ where: { id: Number(audienceId) } });
    if (!a) return NextResponse.json({ error: "audience not found" }, { status: 404 });
    filters = a.filters as FilterInput;
  }
  let tpl = { subject, emailBody, waBody };
  if (templateId) {
    const t = await prisma.template.findUnique({ where: { id: Number(templateId) } });
    if (!t) return NextResponse.json({ error: "template not found" }, { status: 404 });
    tpl = { subject: subject ?? t.subject, emailBody: emailBody ?? t.emailBody, waBody: waBody ?? t.waBody };
  }
  if (!filters) filters = {};

  // count and snapshot job
  const where = buildWhereFromFilters(filters);
  const total = await prisma.contractor.count({ where });

  const job = await prisma.blastJob.create({
    data: {
      audienceId: audienceId ? Number(audienceId) : null,
      templateId: templateId ? Number(templateId) : null,
      filters,
      subject: tpl.subject,
      emailBody: tpl.emailBody,
      waBody: tpl.waBody,
      channelEmail: !!channels?.email,
      channelWhatsApp: !!channels?.whatsapp,
      total,
      status: "QUEUED",
    },
  });

  // hand off to n8n (single call; n8n can fetch recipients via a webhook that calls back to your API if you prefer)
  const payload = {
    jobId: job.id,
    channels: { email: !!channels?.email, whatsapp: !!channels?.whatsapp },
    subject: tpl.subject,
    emailBody: tpl.emailBody,
    waBody: tpl.waBody,
    filters,
  };

  // fire-and-forget; if you want retries, await and check status
  fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});

  return NextResponse.json({ ok: true, total, batches: 1, jobId: job.id }, { status: 202 });
}
