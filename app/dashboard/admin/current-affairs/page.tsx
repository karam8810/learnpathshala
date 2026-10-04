"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Newspaper,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  CalendarDays,
  FileQuestion,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

type CurrentAffair = {
  id: string;
  title: string;
  slug: string;
  affair_date: string;
  status: string;
  featured_image: string | null;
  view_count: number;

  category:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

export default function CurrentAffairsAdminPage() {
  const [items, setItems] =
    useState<CurrentAffair[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  useEffect(() => {
    loadCurrentAffairs();
  }, [status]);

  /*
   * ============================================================
   * LOAD CURRENT AFFAIRS
   * ============================================================
   */

  async function loadCurrentAffairs() {
    setLoading(true);

    let query = supabase
      .from("current_affairs")
      .select(`
        id,
        title,
        slug,
        affair_date,
        status,
        featured_image,
        view_count,
        category:current_affairs_categories(
          id,
          name,
          slug
        )
      `)
      .order("affair_date", {
        ascending: false,
      });

    if (status !== "all") {
      query = query.eq(
        "status",
        status
      );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(error);

      alert(error.message);

      setItems([]);
    } else {
      setItems(
        (data || []) as unknown as CurrentAffair[]
      );
    }

    setLoading(false);
  }

  /*
   * ============================================================
   * SEARCH CURRENT AFFAIRS
   * ============================================================
   */

  async function searchCurrentAffairs() {
    setLoading(true);

    let query = supabase
      .from("current_affairs")
      .select(`
        id,
        title,
        slug,
        affair_date,
        status,
        featured_image,
        view_count,
        category:current_affairs_categories(
          id,
          name,
          slug
        )
      `)
      .order("affair_date", {
        ascending: false,
      });

    if (status !== "all") {
      query = query.eq(
        "status",
        status
      );
    }

    if (search.trim()) {
      query = query.ilike(
        "title",
        `%${search.trim()}%`
      );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(error);

      alert(error.message);

      setLoading(false);

      return;
    }

    setItems(
      (data || []) as unknown as CurrentAffair[]
    );

    setLoading(false);
  }

  /*
   * ============================================================
   * PUBLISH / UNPUBLISH
   * ============================================================
   */

  async function togglePublish(
    item: CurrentAffair
  ) {
    const publish =
      item.status !== "published";

    const { error } =
      await supabase
        .from("current_affairs")
        .update({
          status: publish
            ? "published"
            : "unpublished",

          published_at: publish
            ? new Date().toISOString()
            : undefined,
        })
        .eq("id", item.id);

    if (error) {
      console.error(error);

      alert(error.message);

      return;
    }

    loadCurrentAffairs();
  }

  /*
   * ============================================================
   * MOVE TO TRASH
   * ============================================================
   */

  async function moveToTrash(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Move this current affair to trash?"
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("current_affairs")
        .update({
          status: "trash",
        })
        .eq("id", id);

    if (error) {
      console.error(error);

      alert(error.message);

      return;
    }

    loadCurrentAffairs();
  }

  /*
   * ============================================================
   * CATEGORY
   * ============================================================
   */

  function getCategory(
    category: CurrentAffair["category"]
  ) {
    return Array.isArray(category)
      ? category[0]
      : category;
  }

  /*
   * ============================================================
   * STATUS STYLE
   * ============================================================
   */

  function statusStyle(
    value: string
  ) {
    switch (value) {
      case "published":
        return "bg-green-100 text-green-700";

      case "draft":
        return "bg-gray-100 text-gray-700";

      case "scheduled":
        return "bg-blue-100 text-blue-700";

      case "unpublished":
        return "bg-orange-100 text-orange-700";

      case "trash":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#063B8F]">
                <Newspaper size={22} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-900">
                  Current Affairs
                </h1>

                <p className="text-sm text-slate-500">
                  Manage daily current affairs and exam updates.
                </p>

              </div>

            </div>

          </div>

          {/* NEW CURRENT AFFAIR */}

          <Link
            href="/dashboard/admin/current-affairs/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#052f70]"
          >
            <Plus size={17} />
            New Current Affair
          </Link>

        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">

          <div className="flex flex-col gap-3 md:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    searchCurrentAffairs();
                  }
                }}
                placeholder="Search current affairs..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#063B8F]"
              />

            </div>

            {/* STATUS */}

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="unpublished">
                Unpublished
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="trash">
                Trash
              </option>
            </select>

            {/* SEARCH BUTTON */}

            <button
              type="button"
              onClick={
                searchCurrentAffairs
              }
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Search
            </button>

          </div>

        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

          {loading ? (

            /* LOADING */

            <div className="p-12 text-center text-sm text-slate-500">
              Loading current affairs...
            </div>

          ) : items.length === 0 ? (

            /* EMPTY */

            <div className="p-16 text-center">

              <Newspaper
                size={42}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No current affairs found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create your first current affair.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                {/* ==================================================
                    TABLE HEADER
                ================================================== */}

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Article
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                {/* ==================================================
                    TABLE BODY
                ================================================== */}

                <tbody className="divide-y divide-slate-100">

                  {items.map(
                    (item) => {

                      const category =
                        getCategory(
                          item.category
                        );

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50"
                        >

                          {/* =========================================
                              ARTICLE
                          ========================================= */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-4">

                              {/* IMAGE */}

                              <div className="h-16 w-24 overflow-hidden rounded-lg bg-slate-100">

                                {item.featured_image ? (

                                  <img
                                    src={
                                      item.featured_image
                                    }
                                    alt={
                                      item.title
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-full items-center justify-center">

                                    <Newspaper
                                      size={20}
                                      className="text-slate-300"
                                    />

                                  </div>

                                )}

                              </div>

                              {/* TITLE */}

                              <div className="min-w-0">

                                <div className="line-clamp-2 max-w-md font-semibold text-slate-900">
                                  {item.title}
                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  {item.view_count ||
                                    0}{" "}
                                  views
                                </div>

                              </div>

                            </div>

                          </td>

                          {/* =========================================
                              CATEGORY
                          ========================================= */}

                          <td className="px-5 py-4 text-sm text-slate-600">

                            {category?.name ||
                              "Uncategorized"}

                          </td>

                          {/* =========================================
                              DATE
                          ========================================= */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-slate-600">

                              <CalendarDays
                                size={15}
                              />

                              {new Date(
                                item.affair_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}

                            </div>

                          </td>

                          {/* =========================================
                              STATUS
                          ========================================= */}

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>

                          </td>

                          {/* =========================================
                              ACTIONS
                          ========================================= */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              {/* VIEW */}

                              <Link
                                href={`/current-affairs/${item.slug}`}
                                target="_blank"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                title="View"
                              >
                                <Eye
                                  size={16}
                                />
                              </Link>

                              {/* EDIT */}

                              <Link
                                href={`/dashboard/admin/current-affairs/${item.id}/edit`}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                title="Edit"
                              >
                                <Pencil
                                  size={16}
                                />
                              </Link>

                              {/* ====================================
                                  MANAGE QUIZ
                              ==================================== */}

                              <Link
                                href={`/dashboard/admin/current-affairs/${item.id}/quiz`}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-[#063B8F] hover:bg-blue-100"
                                title="Manage Quiz"
                              >
                                <FileQuestion
                                  size={15}
                                />

                                Quiz
                              </Link>
                              <Link
  href={`/dashboard/admin/current-affairs/${item.id}/quiz/attempts`}
  className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100"
  title="View Quiz Attempts"
>
  <Users size={15} />
  Attempts
</Link>

                              {/* PUBLISH / UNPUBLISH */}

                              <button
                                type="button"
                                onClick={() =>
                                  togglePublish(
                                    item
                                  )
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                title={
                                  item.status ===
                                  "published"
                                    ? "Unpublish"
                                    : "Publish"
                                }
                              >
                                <ExternalLink
                                  size={16}
                                />
                              </button>

                              {/* TRASH */}

                              <button
                                type="button"
                                onClick={() =>
                                  moveToTrash(
                                    item.id
                                  )
                                }
                                className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                                title="Trash"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </DashboardShell>
  );
}