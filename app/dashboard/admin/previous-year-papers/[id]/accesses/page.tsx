"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Phone,
  Search,
  User,
  Users,
  Eye,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

/* =========================================================
   TYPES
========================================================= */

type Paper = {
  id: string;
  title: string;
  exam_name: string;
  year: number;
  subject: string | null;
  file_name: string;
};

type PaperAccess = {
  id: string;
  paper_id: string;
  user_id: string | null;

  student_name: string;
  phone: string;

  action: "view" | "download";

  created_at: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function PreviousYearPaperAccessesPage() {
  const params = useParams();

  const paperId = String(params.id);

  /* =======================================================
     STATE
  ======================================================= */

  const [paper, setPaper] = useState<Paper | null>(null);

  const [accesses, setAccesses] = useState<
    PaperAccess[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    if (!paperId) return;

    loadData();
  }, [paperId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------------
         PAPER
      ----------------------------------------------------- */

      const {
        data: paperData,
        error: paperError,
      } = await supabase
        .from("previous_year_papers")
        .select(`
          id,
          title,
          exam_name,
          year,
          subject,
          file_name
        `)
        .eq("id", paperId)
        .single();

      if (paperError) {
        throw paperError;
      }

      setPaper(paperData as Paper);

      /* -----------------------------------------------------
         ACCESS RECORDS
      ----------------------------------------------------- */

      const {
        data: accessData,
        error: accessError,
      } = await supabase
        .from("previous_year_paper_accesses")
        .select(`
          id,
          paper_id,
          user_id,
          student_name,
          phone,
          action,
          created_at
        `)
        .eq("paper_id", paperId)
        .order("created_at", {
          ascending: false,
        });

      if (accessError) {
        throw accessError;
      }

      setAccesses(
        (accessData || []) as PaperAccess[]
      );
    } catch (err) {
      console.error(
        "Failed to load paper access details:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load access details."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredAccesses = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return accesses;
    }

    return accesses.filter((access) => {
      return (
        access.student_name
          .toLowerCase()
          .includes(query) ||
        access.phone.includes(query)
      );
    });
  }, [accesses, search]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalAccesses = accesses.length;

  const totalViews = accesses.filter(
    (access) => access.action === "view"
  ).length;

  const totalDownloads = accesses.filter(
    (access) => access.action === "download"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardShell role="admin">
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <Link
              href="/dashboard/admin/previous-year-papers"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>

              <div className="flex items-center gap-2">

                <Users
                  size={23}
                  className="text-[#063B8F]"
                />

                <h1 className="text-2xl font-extrabold text-slate-900">
                  Paper Access Details
                </h1>

              </div>

              {paper && (
                <p className="mt-1 text-sm text-slate-500">
                  {paper.title}
                </p>
              )}

            </div>

          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>

        {/* =================================================
            PAPER INFO
        ================================================= */}

        {paper && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <FileText
                  size={27}
                  className="text-red-500"
                />
              </div>

              <div className="min-w-0">

                <h2 className="truncate text-lg font-extrabold text-slate-900">
                  {paper.title}
                </h2>

                <div className="mt-1 flex flex-wrap gap-2">

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#063B8F]">
                    {paper.exam_name}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {paper.year}
                  </span>

                  {paper.subject && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {paper.subject}
                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total Accesses
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {totalAccesses}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Users size={21} />
              </div>

            </div>

          </div>

          {/* Views */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Views
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {totalViews}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#063B8F]">
                <Eye size={21} />
              </div>

            </div>

          </div>

          {/* Downloads */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Downloads
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {totalDownloads}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Download size={21} />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by student name or mobile number..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">

                <Loader2
                  size={21}
                  className="animate-spin text-[#063B8F]"
                />

                Loading access details...

              </div>

            </div>
          ) : filteredAccesses.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                <Users
                  size={25}
                  className="text-slate-400"
                />

              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No submissions yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Students who view or download this
                paper will appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Date & Time
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAccesses.map(
                    (access, index) => (
                      <tr
                        key={access.id}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50/30"
                        }`}
                      >

                        {/* STUDENT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-[#063B8F]">

                              {access.student_name
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <p className="font-bold text-slate-900">
                                {access.student_name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Access #
                                {index + 1}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">

                            <Phone
                              size={15}
                              className="text-slate-400"
                            />

                            {access.phone}

                          </div>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">

                          {access.action ===
                          "view" ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-extrabold text-blue-700">

                              <Eye size={14} />

                              Viewed

                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-extrabold text-green-700">

                              <Download size={14} />

                              Downloaded

                            </span>
                          )}

                        </td>

                        {/* USER */}

                        <td className="px-5 py-4">

                          {access.user_id ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">

                              <CheckCircle2
                                size={13}
                              />

                              Registered

                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">

                              Guest

                            </span>
                          )}

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                            <CalendarDays
                              size={15}
                            />

                            {formatDate(
                              access.created_at
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          filteredAccesses.length > 0 && (
            <p className="text-center text-xs text-slate-400">
              Showing{" "}
              {filteredAccesses.length} of{" "}
              {accesses.length} accesses
            </p>
          )}

      </div>
    </DashboardShell>
  );
}