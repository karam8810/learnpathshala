import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Eye,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import CurrentAffairEditor from "@/components/admin/current-affairs/CurrentAffairEditor";
import CurrentAffairQuiz from "@/components/admin/current-affairs/CurrentAffairQuiz";

type Props = {
  params: {
    slug: string;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Fact = {
  id: string;
  fact_text: string;
  display_order: number;
};

type ExamTag = {
  exam_name: string;
};

type QuizOption = {
  text: string;
};

type CurrentAffairQuestion = {
  id: string;
  affair_id: string;
  question_order: number;
  question_text: string;
  options: QuizOption[];
  points: number;
};

async function getAffair(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("current_affairs")
    .select(`
      id,
      title,
      slug,
      short_description,
      content,
      featured_image,
      featured_image_alt,
      affair_date,
      source_name,
      source_url,
      published_at,
      meta_title,
      meta_description,
      focus_keyword,
      canonical_url,
      og_image,
      robots_index,
      robots_follow,
      schema_type,
      reading_time,
      view_count,

      category:current_affairs_categories(
        id,
        name,
        slug
      ),

      facts:current_affairs_facts(
        id,
        fact_text,
        display_order
      ),

      exams:current_affairs_exam_tags(
        exam_name
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Current affair fetch error:", error);
    return null;
  }

  return data;
}

async function getQuestions(
  affairId: string
): Promise<CurrentAffairQuestion[]> {
  const supabase = await createClient();

  /*
   * IMPORTANT:
   * Do NOT select correct_answer here.
   *
   * The browser should only receive:
   * - question
   * - options
   * - points
   *
   * Correct answers should remain on the server.
   */

  const { data, error } = await supabase
    .from("current_affair_questions")
    .select(`
      id,
      affair_id,
      question_order,
      question_text,
      options,
      points
    `)
    .eq("affair_id", affairId)
    .order("question_order", {
      ascending: true,
    });

  if (error) {
    console.error("Current affair questions error:", error);
    return [];
  }

  return (data || []).map((question: any) => ({
    id: question.id,
    affair_id: question.affair_id,
    question_order: question.question_order,
    question_text: question.question_text,
    options: Array.isArray(question.options)
      ? question.options
      : [],
    points: question.points || 1,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const affair = await getAffair(params.slug);

  if (!affair) {
    return {
      title: "Current Affair Not Found | LearnPathshala",
    };
  }

  const title =
    affair.meta_title ||
    affair.title;

  const description =
    affair.meta_description ||
    affair.short_description ||
    affair.title;

  const canonical =
    affair.canonical_url ||
    `/current-affairs/${affair.slug}`;

  return {
    title,
    description,

    keywords: affair.focus_keyword
      ? [
          affair.focus_keyword,
          "current affairs",
          "SSC current affairs",
          "competitive exam current affairs",
        ]
      : [
          "current affairs",
          "competitive exams",
        ],

    alternates: {
      canonical,
    },

    robots: {
      index: affair.robots_index ?? true,
      follow: affair.robots_follow ?? true,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",

      publishedTime:
        affair.published_at || undefined,

      images: affair.og_image
        ? [
            {
              url: affair.og_image,
              alt: affair.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: affair.og_image
        ? [affair.og_image]
        : undefined,
    },
  };
}

export default async function CurrentAffairPage({
  params,
}: Props) {
  const affair = await getAffair(params.slug);

  if (!affair) {
    notFound();
  }

  /*
   * ----------------------------------------------------
   * CATEGORY
   * ----------------------------------------------------
   */

  const category: Category | null =
    Array.isArray(affair.category)
      ? affair.category[0] || null
      : affair.category;

  /*
   * ----------------------------------------------------
   * FACTS
   * ----------------------------------------------------
   */

  const facts: Fact[] =
    Array.isArray(affair.facts)
      ? [...affair.facts].sort(
          (a: Fact, b: Fact) =>
            a.display_order -
            b.display_order
        )
      : [];

  /*
   * ----------------------------------------------------
   * EXAM TAGS
   * ----------------------------------------------------
   */

  const exams: ExamTag[] =
    Array.isArray(affair.exams)
      ? affair.exams
      : [];

  /*
   * ----------------------------------------------------
   * QUIZ QUESTIONS
   * ----------------------------------------------------
   */

  const questions =
    await getQuestions(affair.id);

  /*
   * ----------------------------------------------------
   * SITE URL
   * ----------------------------------------------------
   */

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const articleUrl =
    `${siteUrl}/current-affairs/${affair.slug}`;

  /*
   * ----------------------------------------------------
   * VIEW COUNT
   * ----------------------------------------------------
   */

  const supabase = await createClient();

  await supabase.rpc(
    "increment_current_affair_view",
    {
      p_affair_id: affair.id,
    }
  );

  /*
   * ----------------------------------------------------
   * DETAILED VIEW
   * ----------------------------------------------------
   */

  await supabase
    .from("current_affair_views")
    .insert({
      affair_id: affair.id,
    });

  /*
   * ----------------------------------------------------
   * ARTICLE JSON-LD
   * ----------------------------------------------------
   */

  const articleSchema = {
    "@context": "https://schema.org",

    "@type":
      affair.schema_type ||
      "NewsArticle",

    headline:
      affair.title,

    description:
      affair.short_description ||
      affair.meta_description ||
      "",

    image:
      affair.featured_image
        ? [affair.featured_image]
        : [],

    datePublished:
      affair.published_at ||
      affair.affair_date,

    dateModified:
      affair.published_at ||
      affair.affair_date,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    publisher: {
      "@type": "Organization",

      name: "LearnPathshala",

      logo: {
        "@type": "ImageObject",

        url:
          `${siteUrl}/learnpathshalalogo.png`,
      },
    },

    author: {
      "@type": "Organization",
      name: "LearnPathshala",
    },

    articleSection:
      category?.name ||
      "Current Affairs",
  };

  /*
   * ----------------------------------------------------
   * BREADCRUMB JSON-LD
   * ----------------------------------------------------
   */

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",

        position: 1,

        name: "Home",

        item: siteUrl,
      },

      {
        "@type": "ListItem",

        position: 2,

        name: "Current Affairs",

        item:
          `${siteUrl}/current-affairs`,
      },

      {
        "@type": "ListItem",

        position: 3,

        name: affair.title,

        item: articleUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          JSON-LD
      ===================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleSchema
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema
            ),
        }}
      />

      {/* =====================================================
          ARTICLE
      ===================================================== */}

      <article className="bg-white">

        <div className="mx-auto max-w-5xl px-5 py-10">

          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <nav className="mb-7 text-sm text-slate-500">

            <Link
              href="/"
              className="hover:text-[#063B8F]"
            >
              Home
            </Link>

            <span className="mx-2">
              /
            </span>

            <Link
              href="/current-affairs"
              className="hover:text-[#063B8F]"
            >
              Current Affairs
            </Link>

            {category && (
              <>
                <span className="mx-2">
                  /
                </span>

                <Link
                  href={`/current-affairs/category/${category.slug}`}
                  className="hover:text-[#063B8F]"
                >
                  {category.name}
                </Link>
              </>
            )}

          </nav>

          {/* =================================================
              CATEGORY
          ================================================= */}

          {category && (
            <div className="mb-4">

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#063B8F]">
                {category.name}
              </span>

            </div>
          )}

          {/* =================================================
              TITLE
          ================================================= */}

          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl md:leading-tight">
            {affair.title}
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {affair.short_description && (
            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
              {affair.short_description}
            </p>
          )}

          {/* =================================================
              META
          ================================================= */}

          <div className="mt-6 flex flex-wrap gap-5 border-y border-slate-200 py-4 text-sm text-slate-500">

            <div className="flex items-center gap-2">
              <CalendarDays size={16} />

              {new Date(
                affair.affair_date
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} />

              {affair.reading_time || 1}
              {" "}
              min read
            </div>

            <div className="flex items-center gap-2">
              <Eye size={16} />

              {(affair.view_count || 0) + 1}
              {" "}
              views
            </div>

          </div>

          {/* =================================================
              FEATURED IMAGE
          ================================================= */}

          {affair.featured_image && (
            <div className="mt-8 overflow-hidden rounded-2xl">

              <img
                src={affair.featured_image}
                alt={
                  affair.featured_image_alt ||
                  affair.title
                }
                className="w-full object-cover"
              />

            </div>
          )}

          {/* =================================================
              BODY
          ================================================= */}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div>

              {/* ===============================================
                  IMPORTANT FACTS
              =============================================== */}

              {facts.length > 0 && (
                <section className="mb-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">

                  <h2 className="text-xl font-bold text-slate-900">
                    Important Facts
                  </h2>

                  <ul className="mt-4 space-y-3">

                    {facts.map(
                      (fact) => (
                        <li
                          key={fact.id}
                          className="flex gap-3 text-sm leading-7 text-slate-700"
                        >

                          <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#063B8F]" />

                          <span>
                            {fact.fact_text}
                          </span>

                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}

              {/* ===============================================
                  ARTICLE CONTENT
              =============================================== */}

              <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
                {affair.content}
              </div>

              {/* ===============================================
                  MCQ QUIZ
              =============================================== */}

              {questions.length > 0 && (
                <section className="mt-12">

                  <div className="mb-6">

                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#063B8F]">
                      Practice Quiz
                    </span>

                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">
                      Test Your Knowledge
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Attempt the questions based on
                      this current affairs article.
                    </p>

                  </div>

                  <CurrentAffairQuiz
                    questions={questions}
                    affairId={affair.id}
                  />

                </section>
              )}

              {/* ===============================================
                  SOURCE
              =============================================== */}

              {affair.source_name && (
                <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="text-sm font-bold text-slate-900">
                    Source
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm">

                    {affair.source_url ? (
                      <a
                        href={affair.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-[#063B8F]"
                      >

                        {affair.source_name}

                        <ExternalLink
                          size={14}
                        />

                      </a>
                    ) : (
                      <span>
                        {affair.source_name}
                      </span>
                    )}

                  </div>

                </div>
              )}

              {/* ===============================================
                  EXAM TAGS
              =============================================== */}

              {exams.length > 0 && (
                <div className="mt-8">

                  <h2 className="text-lg font-bold">
                    Useful For
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {exams.map(
                      (
                        exam,
                        index
                      ) => (
                        <span
                          key={index}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          {exam.exam_name}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="space-y-5">

              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <h2 className="font-bold text-slate-900">
                  Current Affairs
                </h2>

                <div className="mt-4 space-y-2">

                  <Link
                    href="/current-affairs"
                    className="block rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-[#063B8F]"
                  >
                    All Current Affairs
                  </Link>

                  <Link
                    href={`/current-affairs/date/${affair.affair_date}`}
                    className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Same Day
                  </Link>

                  {category && (
                    <Link
                      href={`/current-affairs/category/${category.slug}`}
                      className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {category.name}
                    </Link>
                  )}

                </div>

              </div>

            </aside>

          </div>

        </div>

      </article>

    </main>
  );
}