import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

type Props = {
  params: {
    month: string;
  };
};

function validMonth(
  value: string
) {
  return /^\d{4}-\d{2}$/.test(
    value
  );
}

export default async function MonthlyCurrentAffairs({
  params,
}: Props) {

  if (!validMonth(params.month)) {
    notFound();
  }

  const start =
    `${params.month}-01`;

  const [year, month] =
    params.month
      .split("-")
      .map(Number);

  const endDate =
    new Date(
      year,
      month,
      0
    );

  const end =
    `${year}-${String(month).padStart(
      2,
      "0"
    )}-${String(
      endDate.getDate()
    ).padStart(2, "0")}`;

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
      .gte(
        "affair_date",
        start
      )
      .lte(
        "affair_date",
        end
      )
      .order(
        "affair_date",
        {
          ascending: false,
        }
      );

  const monthName =
    new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-5 py-12">

        <Link
          href="/current-affairs"
          className="text-sm font-semibold text-[#063B8F]"
        >
          ← All Current Affairs
        </Link>

        <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
          Current Affairs —{" "}
          {monthName}
        </h1>

        <p className="mt-2 text-slate-600">
          Daily current affairs and important
          exam updates from {monthName}.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {(data || []).map(
            (item) => (
              <Link
                key={item.id}
                href={`/current-affairs/${item.slug}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-lg"
              >

                {item.featured_image && (
                  <img
                    src={
                      item.featured_image
                    }
                    alt={
                      item.title
                    }
                    className="aspect-video w-full object-cover"
                  />
                )}

                <div className="p-5">

                  <div className="text-xs font-semibold text-[#063B8F]">
                    {new Date(
                      item.affair_date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                      }
                    )}
                  </div>

                  <h2 className="mt-2 font-bold text-slate-900">
                    {item.title}
                  </h2>

                  {item.short_description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {
                        item.short_description
                      }
                    </p>
                  )}

                </div>

              </Link>
            )
          )}

        </div>

      </div>

    </main>
  );
}