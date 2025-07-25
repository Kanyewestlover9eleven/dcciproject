import { NextResponse } from "next/server";
import { fetchPagePosts } from "@/features/activities/services/facebook";

export async function GET() {
  try {
    const posts = await fetchPagePosts({ limit: 50 });
    return NextResponse.json(posts);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
