import type { Metadata } from "next";
import Link from "next/link";

import {
  CalendarDays,
  ChevronRight,
  Newspaper,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title:
    "Current Affairs 2026 | Daily Current Affairs for SSC, Banking & Railway",
  description:
    "Read daily current affairs, important facts, government updates, national and international news for SSC CGL, Banking, Railway, UPSC and other competitive exams.",
  keywords: [
    "current affairs",
    "daily current affairs",
    "current affairs 2026",
    "SSC current affairs",
    "banking current affairs",
    "railway current affairs",
    "UPSC current affairs",
  ],
  alternates: {
    canonical:
      "/current-affairs",
  },
  openGraph: {
    title:
      "Current Affairs 2026 | LearnPathshala",
    description:
      "Daily current affairs and important exam updates for competitive exams.",
    type: "website",
    url:
      "/current-affairs",
  },
};

type CurrentAffair = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  featured_image: string | null;
  affair_date: string;
  reading_time: number;
  view_count: number;

  category:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | null;
};

export default async function CurrentAffairsPage() {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("current_affairs")
      .select(`
        id,
        title,
        slug,
        short_description,
        featured_image,
        affair_date,
        reading_time,
        view_count,
        category:current_affairs_categories(
          id,
          name,
          slug
        )
      `)
      .eq(
        "status",
        "published"
      )
      .order(
        "affair_date",
        {
          ascending: false,
        }
      )
      .limit(30);

  if (error) {
    console.error(
      "Current affairs error:",
      error
    );
  }

  const affairs =
    (data || []) as unknown as CurrentAffair[];

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-14">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#063B8F]">
            <Newspaper size={16} />
            LearnPathshala Current Affairs
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Daily Current Affairs 2026
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Read important national and international
            current affairs, government updates,
            economy, science, sports and other
            exam-relevant news for competitive exams.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">

            <Link
              href="/current-affairs/date/today"
              className="rounded-xl bg-[#063B8F] px-5 py-3 text-sm font-bold text-white"
            >
              Today's Current Affairs
            </Link>

            <Link
              href="/current-affairs/month/2026-10"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
            >
              October 2026
            </Link>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-5 py-10">

        {affairs.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Newspaper
              className="mx-auto text-slate-300"
              size={45}
            />

            <h2 className="mt-4 text-xl font-bold">
              No current affairs available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New current affairs will appear here.
            </p>
          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {affairs.map(
              (affair) => {

                const category =
                  Array.isArray(
                    affair.category
                  )
                    ? affair.category[0]
                    : affair.category;

                return (
                  <article
                    key={affair.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    <Link
                      href={`/current-affairs/${affair.slug}`}
                    >

                      <div className="aspect-[16/9] overflow-hidden bg-slate-100">

                        {affair.featured_image ? (
                          <img
                            src={
                              affair.featured_image
                            }
                            alt={
                              affair.title
                            }
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Newspaper
                              size={40}
                              className="text-slate-300"
                            />
                          </div>
                        )}

                      </div>

                    </Link>

                    <div className="p-5">

                      {category && (
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#063B8F]">
                          {category.name}
                        </span>
                      )}

                      <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-900">
                        <Link
                          href={`/current-affairs/${affair.slug}`}
                          className="hover:text-[#063B8F]"
                        >
                          {affair.title}
                        </Link>
                      </h2>

                      {affair.short_description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {
                            affair.short_description
                          }
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <div className="flex items-center gap-2 text-xs text-slate-500">

                          <CalendarDays
                            size={14}
                          />

                          {new Date(
                            affair.affair_date
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}

                        </div>

                        <span className="text-xs text-slate-500">
                          {affair.reading_time || 1} min read
                        </span>

                      </div>

                      <Link
                        href={`/current-affairs/${affair.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#063B8F]"
                      >
                        Read Current Affair
                        <ChevronRight
                          size={16}
                        />
                      </Link>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}