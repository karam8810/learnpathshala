import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CalendarDays,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

type Props = {
  params: {
    date: string;
  };
};

function isValidDate(
  value: string
) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  );
}

export default async function DailyCurrentAffairs({
  params,
}: Props) {

  if (!isValidDate(params.date)) {
    notFound();
  }

  const supabase =
    await createClient();

  const { data } =
    await supabase
      .from("current_affairs")
      .select(`
        id,
        title,
        slug,
        short_description,
        featured_image,
        affair_date
      `)
      .eq(
        "status",
        "published"
      )
      .eq(
        "affair_date",
        params.date
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  const date =
    new Date(
      `${params.date}T00:00:00`
    );

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-5 py-12">

        <div className="mb-8">

          <Link
            href="/current-affairs"
            className="text-sm font-semibold text-[#063B8F]"
          >
            ← All Current Affairs
          </Link>

          <div className="mt-5 flex items-center gap-3">

            <CalendarDays
              size={28}
              className="text-[#063B8F]"
            />

            <h1 className="text-3xl font-extrabold text-slate-900">
              Current Affairs —{" "}
              {date.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </h1>

          </div>

        </div>

        {(!data ||
          data.length === 0) ? (

          <div className="rounded-2xl bg-white p-12 text-center">
            No current affairs found for this date.
          </div>

        ) : (

          <div className="space-y-4">

            {data.map(
              (item) => (
                <Link
                  key={item.id}
                  href={`/current-affairs/${item.slug}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md"
                >

                  <div className="flex gap-5">

                    {item.featured_image && (
                      <img
                        src={
                          item.featured_image
                        }
                        alt={
                          item.title
                        }
                        className="hidden h-28 w-44 rounded-xl object-cover sm:block"
                      />
                    )}

                    <div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {item.title}
                      </h2>

                      {item.short_description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {
                            item.short_description
                          }
                        </p>
                      )}

                    </div>

                  </div>

                </Link>
              )
            )}

          </div>

        )}

      </div>

    </main>
  );
}