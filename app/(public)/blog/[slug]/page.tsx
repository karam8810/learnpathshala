import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  BookOpen,
  Tag,
  ArrowRight,
} from "lucide-react";

import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: {
    slug: string;
  };
};

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

type BlogTag = {
  id: string;
  name: string;
  slug: string;
};

type BlogAuthor = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;

  featured_image: string | null;
  featured_image_alt: string | null;

  published_at: string | null;
  updated_at: string | null;
  reading_time: number | null;

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

  schema_type: string | null;

  category:
    | BlogCategory
    | BlogCategory[]
    | null;

  author:
    | BlogAuthor
    | BlogAuthor[]
    | null;

  blog_post_tags: Array<{
    tag:
      | BlogTag
      | BlogTag[]
      | null;
  }>;
};

/* ============================================================
   GET BLOG BY SLUG
============================================================ */

async function getPost(
  slug: string
): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,

      featured_image,
      featured_image_alt,

      published_at,
      updated_at,
      reading_time,

      meta_title,
      meta_description,
      focus_keyword,
      canonical_url,

      og_title,
      og_description,
      og_image,

      twitter_title,
      twitter_description,
      twitter_image,

      robots_index,
      robots_follow,

      schema_type,

      category:blog_categories(
        id,
        name,
        slug
      ),

      author:profiles(
        id,
        full_name,
        avatar_url
      ),

      blog_post_tags(
        tag:blog_tags(
          id,
          name,
          slug
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(
      "Blog detail error:",
      error
    );

    return null;
  }

  return data as unknown as BlogPost;
}

/* ============================================================
   SEO
============================================================ */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getPost(
    params.slug
  );

  if (!post) {
    return {
      title:
        "Blog Not Found | LearnPathshala",
      description:
        "The requested LearnPathshala blog article was not found.",
    };
  }

  const title =
    post.meta_title ||
    post.title;

  const description =
    post.meta_description ||
    post.excerpt ||
    `Read ${post.title} on LearnPathshala.`;

  const image =
    post.og_image ||
    post.featured_image ||
    undefined;

  const canonical =
    post.canonical_url ||
    `https://learnpathshala.com/blog/${post.slug}`;

  return {
    title,

    description,

    keywords: post.focus_keyword
      ? [post.focus_keyword]
      : undefined,

    alternates: {
      canonical,
    },

    robots: {
      index:
        post.robots_index ?? true,

      follow:
        post.robots_follow ?? true,
    },

    openGraph: {
      title:
        post.og_title ||
        title,

      description:
        post.og_description ||
        description,

      url: canonical,

      type: "article",

      publishedTime:
        post.published_at ||
        undefined,

      modifiedTime:
        post.updated_at ||
        undefined,

      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt:
                post.featured_image_alt ||
                post.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: image
        ? "summary_large_image"
        : "summary",

      title:
        post.twitter_title ||
        title,

      description:
        post.twitter_description ||
        description,

      images: image
        ? [image]
        : undefined,
    },
  };
}

/* ============================================================
   PAGE
============================================================ */

export default async function BlogDetailPage({
  params,
}: PageProps) {
  const post = await getPost(
    params.slug
  );

  if (!post) {
    notFound();
  }

  const category =
    Array.isArray(post.category)
      ? post.category[0]
      : post.category;

  const author =
    Array.isArray(post.author)
      ? post.author[0]
      : post.author;

  const tags =
    post.blog_post_tags
      ?.map((item) => {
        if (!item.tag) {
          return null;
        }

        return Array.isArray(item.tag)
          ? item.tag[0]
          : item.tag;
      })
      .filter(
        (
          tag
        ): tag is BlogTag =>
          Boolean(tag)
      ) || [];

  const canonical =
    post.canonical_url ||
    `https://learnpathshala.com/blog/${post.slug}`;

  /* ==========================================================
     STRUCTURED DATA
  ========================================================== */

  const articleSchema = {
    "@context":
      "https://schema.org",

    "@type":
      post.schema_type ||
      "Article",

    headline:
      post.title,

    description:
      post.meta_description ||
      post.excerpt ||
      "",

    image:
      post.featured_image
        ? [post.featured_image]
        : undefined,

    datePublished:
      post.published_at ||
      undefined,

    dateModified:
      post.updated_at ||
      post.published_at ||
      undefined,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },

    author: {
      "@type": "Person",

      name:
        author?.full_name ||
        "LearnPathshala",
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "LearnPathshala",

      logo: {
        "@type":
          "ImageObject",

        url:
          "https://learnpathshala.com/logo.png",
      },
    },

    articleSection:
      category?.name ||
      undefined,

    keywords:
      post.focus_keyword ||
      undefined,
  };

  return (
    <main className="min-h-screen bg-white">

      {/* JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleSchema
            ),
        }}
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <article>

        <header className="border-b border-slate-200 bg-slate-50">

          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

            <Link
              href="/blog"
              className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#063B8F]"
            >
              <ArrowLeft size={16} />

              Back to Blog
            </Link>

            {category && (
              <div className="mb-4">

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#063B8F]">

                  <BookOpen size={14} />

                  {category.name}

                </span>

              </div>
            )}

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500">

              {post.published_at && (
                <span className="flex items-center gap-2">
                  <CalendarDays
                    size={16}
                  />

                  {new Date(
                    post.published_at
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              )}

              {post.reading_time && (
                <span className="flex items-center gap-2">
                  <Clock size={16} />

                  {post.reading_time} min read
                </span>
              )}

              {author && (
                <span>
                  By{" "}
                  <strong className="text-slate-700">
                    {author.full_name}
                  </strong>
                </span>
              )}

            </div>

          </div>

        </header>

        {/* ===================================================
            FEATURED IMAGE
        =================================================== */}

        {post.featured_image && (
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">

            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl bg-slate-100">

              <Image
                src={
                  post.featured_image
                }
                alt={
                  post.featured_image_alt ||
                  post.title
                }
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
              />

            </div>

          </div>
        )}

        {/* ===================================================
            ARTICLE CONTENT
        =================================================== */}

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="text-lg leading-8 text-slate-700">

            {post.content
              .split(/\n+/)
              .map(
                (
                  paragraph,
                  index
                ) => {

                  const text =
                    paragraph.trim();

                  if (!text) {
                    return null;
                  }

                  return (
                    <p
                      key={index}
                      className="mb-5"
                    >
                      {text}
                    </p>
                  );
                }
              )}

          </div>

          {/* =================================================
              TAGS
          ================================================= */}

          {tags.length > 0 && (
            <div className="mt-12 border-t border-slate-200 pt-7">

              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">

                <Tag size={16} />

                Tags

              </div>

              <div className="flex flex-wrap gap-2">

                {tags.map(
                  (tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      #{tag.name}
                    </span>
                  )
                )}

              </div>

            </div>
          )}

        </div>

      </article>

      {/* =====================================================
          FOOTER CTA
      ===================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3 text-sm font-bold text-white hover:bg-[#052f70]"
          >
            Explore More Articles

            <ArrowRight
              size={17}
            />
          </Link>

        </div>

      </section>

    </main>
  );
}