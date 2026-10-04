import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Blog | LearnPathshala",
  description:
    "Latest exam updates, admit cards, results, study material, government jobs and preparation tips from LearnPathshala.",
};

export const revalidate = 60;

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  published_at: string | null;
  reading_time: number | null;

  category:
    | BlogCategory
    | BlogCategory[]
    | null;
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      featured_image_alt,
      published_at,
      reading_time,
      category:blog_categories(
        id,
        name,
        slug
      )
    `)
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Public blog error:",
      error
    );
  }

  const posts =
    (data || []) as unknown as BlogPost[];

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#063B8F]">
              <BookOpen size={16} />

              LearnPathshala Blog
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Latest Exam & Education Updates
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Stay updated with the latest exam
              notifications, admit cards, results,
              study material, preparation tips and
              government job updates.
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          BLOG POSTS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {posts.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">

            <BookOpen
              size={44}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No blogs published yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Published articles will appear here.
            </p>

          </div>

        ) : (

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">

            {posts.map((post) => {

              /*
               * Supabase may return a relationship
               * as an object or an array depending
               * on the relationship definition.
               */

              const category =
                Array.isArray(post.category)
                  ? post.category[0]
                  : post.category;

              return (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* =========================================
                      IMAGE
                  ========================================= */}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="block"
                  >

                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">

                      {post.featured_image ? (

                        <Image
                          src={post.featured_image}
                          alt={
                            post.featured_image_alt ||
                            post.title
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center">
                          <BookOpen
                            size={42}
                            className="text-slate-300"
                          />
                        </div>

                      )}

                    </div>

                  </Link>

                  {/* =========================================
                      CONTENT
                  ========================================= */}

                  <div className="p-5">

                    {/* CATEGORY */}

                    {category && (
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#063B8F]">
                        {category.name}
                      </span>
                    )}

                    {/* TITLE */}

                    <h2 className="mt-3 line-clamp-2 text-xl font-bold leading-7 text-slate-900 transition group-hover:text-[#063B8F]">

                      <Link
                        href={`/blog/${post.slug}`}
                      >
                        {post.title}
                      </Link>

                    </h2>

                    {/* EXCERPT */}

                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {post.excerpt}
                      </p>
                    )}

                    {/* META */}

                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">

                      {post.published_at && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />

                          {new Date(
                            post.published_at
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      )}

                      {post.reading_time && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />

                          {post.reading_time} min read
                        </span>
                      )}

                    </div>

                    {/* READ ARTICLE */}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#063B8F]"
                    >
                      Read Article

                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}