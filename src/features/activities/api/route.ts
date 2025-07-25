import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const data = await prisma.activity.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const activity = await prisma.activity.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      description: body.description,
      imageUrl: body.imageUrl,
      registerUrl: body.registerUrl,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
