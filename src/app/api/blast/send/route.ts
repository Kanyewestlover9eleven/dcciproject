// src/app/api/blast/send/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereFromFilters, type FilterInput } from "@/lib/contractorFilters";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: Request) {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET ?? "";

  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const {
    audienceId,
    templateId,
    channels,
    filters: rawFilters,
    subject,
    emailBody,
    waBody,
  } = body;

  // resolve audience & template if IDs provided
  let filters: FilterInput | undefined = rawFilters;
  if (audienceId) {
    const a = await prisma.audience.findUnique({
      where: { id: Number(audienceId) },
    });
    if (!a) {
      return NextResponse.json(
        { error: "audience not found" },
        { status: 404 }
      );
    }
    filters = a.filters as FilterInput;
  }

  let tpl = { subject, emailBody, waBody };
  if (templateId) {
    const t = await prisma.template.findUnique({
      where: { id: Number(templateId) },
    });
    if (!t) {
      return NextResponse.json(
        { error: "template not found" },
        { status: 404 }
      );
    }
    tpl = {
      subject: subject ?? t.subject,
      emailBody: emailBody ?? t.emailBody,
      waBody: waBody ?? t.waBody,
    };
  }
  if (!filters) filters = {};

  // count recipients
  const where = buildWhereFromFilters(filters);
  const total = await prisma.contractor.count({ where });

  // create job record
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

  // prepare payload for n8n
  const payload = {
    jobId: job.id,
    channels: { email: !!channels?.email, whatsapp: !!channels?.whatsapp },
    subject: tpl.subject,
    emailBody: tpl.emailBody,
    waBody: tpl.waBody,
    filters,
  };

  // call n8n webhook
  try {
    const r = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shared-Secret": N8N_WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    });

    const txt = await r.text().catch(() => "");
    console.log(
      "[blast→n8n]",
      N8N_WEBHOOK_URL,
      r.status,
      txt.slice(0, 300)
    );

    if (!r.ok) {
      return NextResponse.json(
        { error: `n8n ${r.status}`, body: txt },
        { status: 502 }
      );
    }
  } catch (e: any) {
    console.error("[blast→n8n] fetch error", e?.message || e);
    return NextResponse.json(
      { error: "n8n fetch failed", detail: String(e?.message || e) },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { ok: true, total, batches: 1, jobId: job.id },
    { status: 202 }
  );
}
