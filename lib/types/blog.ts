export type BlogStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "scheduled"
  | "unpublished"
  | "trash";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;

  featured_image: string | null;
  featured_image_alt: string | null;

  author_id: string | null;
  category_id: string | null;

  status: BlogStatus;

  published_at: string | null;
  scheduled_at: string | null;

  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;

  og_title: string | null;
  og_description: string | null;
  og_image: string | null;

  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;

  robots_index: boolean;
  robots_follow: boolean;

  schema_type: string;

  reading_time: number;
  view_count: number;

  created_at: string;
  updated_at: string;

  category?: BlogCategory | null;
}