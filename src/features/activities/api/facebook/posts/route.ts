import { NextResponse } from "next/server";
import { fetchPagePosts } from "@/features/activities/services/facebook";

export async function GET() {
  try {
    const posts = await fetchPagePosts({ limit: 50 });
    return NextResponse.json(posts);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
