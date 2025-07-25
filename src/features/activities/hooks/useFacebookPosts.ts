"use client";

import { useQuery } from "@tanstack/react-query";

export type FbPost = {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  // Graph API might also return event fields if you request them
  name?: string;
  start_time?: string;
};

type FbResponse = {
  data: FbPost[];
  paging?: { next?: string; cursors?: { after?: string } };
};

export function useFacebookPosts(limit = 10) {
  return useQuery<FbResponse>({
    queryKey: ["fb-posts", limit],
    queryFn: async () => {
      const res = await fetch(`/api/facebook/posts?limit=${limit}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch FB posts");
      return res.json();
    },
  });
}
