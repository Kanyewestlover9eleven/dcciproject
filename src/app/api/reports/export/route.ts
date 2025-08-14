import { NextResponse } from "next/server";

// We’ll just proxy to /api/reports/aggregate and emit CSV
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/api/reports/aggregate";
  const aggRes = await fetch(url.toString(), { cache: "no-store" });
  if (!aggRes.ok) {
    return new NextResponse("Failed to build report", { status: 500 });
  }
  const { data } = await aggRes.json();

  const lines = [["Label", "Count"], ...data.map((r: any) => [String(r.label), String(r.count)])]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(lines, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="report.csv"`,
    },
  });
}
