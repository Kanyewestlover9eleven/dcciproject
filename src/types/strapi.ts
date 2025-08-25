// Strapi v4 default response shapes
export type StrapiMedia = {
  data: {
    id: number;
    attributes: {
      url: string;
      alternativeText?: string | null;
      caption?: string | null;
      width?: number;
      height?: number;
      mime?: string;
      size?: number;
    };
  } | null;
};

export type StrapiList<T> = {
  data: Array<{
    id: number;
    attributes: T & {
      createdAt: string;
      updatedAt: string;
      publishedAt?: string | null;
    };
  }>;
  meta: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
};

export type StrapiOne<T> = {
  data: {
    id: number;
    attributes: T & {
      createdAt: string;
      updatedAt: string;
      publishedAt?: string | null;
    };
  } | null;
};

export type MediaItem = {
  id: number;
  name: string;
  url: string;                 // absolute URL
  alternativeText?: string | null;
  text?: string | null;
};

// Optional: what your Activities list returns after mapping
export type ActivityListItem = {
  id: number;
  title: string;
  slug: string;
  date: string | null;
  coverUrl: string | null;     // absolute URL
};
