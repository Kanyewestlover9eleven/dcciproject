// src/features/activities/services/facebook.ts
"use server";
import "server-only";

/**
 * Minimal Graph API helper for pulling posts from a FB Page feed
 * and mapping them into your Activity shape.
 *
 * Requires env vars:
 *  - FACEBOOK_PAGE_ID
 *  - FACEBOOK_ACCESS_TOKEN  (page token or long-lived user token with read permissions)
 */

const GRAPH_URL = process.env.FB_GRAPH_URL ?? "https://graph.facebook.com/v19.0";

export type FbPost = {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
};

export interface FetchPostsOpts {
  pageId?: string;
  token?: string;
  limit?: number;
  since?: string; // ISO date
  until?: string; // ISO date
}

/**
 * Fetch raw posts from a page.
 */
export async function fetchPagePosts({
  pageId = process.env.FACEBOOK_PAGE_ID!,
  token = process.env.FACEBOOK_ACCESS_TOKEN!,
  limit = 25,
  since,
  until,
}: FetchPostsOpts = {}): Promise<FbPost[]> {
  if (!pageId || !token) {
    throw new Error("FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN missing");
  }

  const params = new URLSearchParams({
    access_token: token,
    fields: "id,message,created_time,full_picture,permalink_url",
    limit: String(limit),
  });
  if (since) params.append("since", since);
  if (until) params.append("until", until);

  const res = await fetch(`${GRAPH_URL}/${pageId}/posts?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook fetch failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return (json.data ?? []) as FbPost[];
}

/**
 * Your DB Activity-like shape (adjust if you changed the model).
 */
export type ActivityInput = {
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  registerUrl?: string;
  source: "FACEBOOK";
  sourceId: string;
  category?: string; // CAPACITY_BUILDING | BUSINESS_TALK | ...
};

/**
 * Map a FB post into your Activity shape.
 * First line of the message becomes the title (fallback to generic if empty).
 */
export function mapFbPostToActivity(
  post: FbPost,
  category?: string
): ActivityInput {
  const firstLine = post.message?.split("\n")[0]?.trim();
  return {
    title: firstLine?.length ? firstLine.slice(0, 100) : "Facebook Post",
    description: post.message ?? "",
    date: post.created_time,
    imageUrl: post.full_picture,
    registerUrl: post.permalink_url,
    source: "FACEBOOK",
    sourceId: post.id,
    category,
  };
}
