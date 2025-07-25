export type ActivityCategory = "CAPACITY_BUILDING" | "BUSINESS_TALK" | "OTHER";
export type ActivitySource   = "MANUAL" | "FACEBOOK";

export interface Activity {
  id: number;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  registerUrl?: string;
  createdAt: string;
  updatedAt: string;
  category: ActivityCategory;
  source: ActivitySource;
  fbPostId?: string | null;
  published: boolean;
}
