import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF only" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "receipts");
  await fs.mkdir(dir, { recursive: true });
  const key = `${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.pdf`;
  const fp = path.join(dir, key);
  await fs.writeFile(fp, buf);
  const url = `/receipts/${encodeURIComponent(key)}`; // public URL

  return NextResponse.json({ url });
}
