"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Search,
  Calendar,
  Users,
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
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  is_published: boolean;
  created_at: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function PreviousYearPapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  /* =======================================================
     LOAD PAPERS
  ======================================================= */

  useEffect(() => {
    loadPapers();
  }, []);

  async function loadPapers() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("previous_year_papers")
        .select("*")
        .order("year", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPapers(data || []);
    } catch (error) {
      console.error(
        "Failed to load papers:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     DELETE PAPER
  ======================================================= */

  async function deletePaper(paper: Paper) {
    const confirmed = window.confirm(
      `Delete "${paper.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      /* ---------------------------------------------------
         DELETE FILE FROM STORAGE
      --------------------------------------------------- */

      const { error: storageError } =
        await supabase.storage
          .from("previous-year-papers")
          .remove([paper.file_path]);

      if (storageError) {
        console.error(
          "Storage delete error:",
          storageError
        );
      }

      /* ---------------------------------------------------
         DELETE DATABASE RECORD

         Access records linked to this paper will also
         be deleted because of ON DELETE CASCADE.
      --------------------------------------------------- */

      const { error: dbError } = await supabase
        .from("previous_year_papers")
        .delete()
        .eq("id", paper.id);

      if (dbError) {
        throw dbError;
      }

      setPapers((previous) =>
        previous.filter(
          (item) => item.id !== paper.id
        )
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Failed to delete paper. Please try again."
      );
    }
  }

  /* =======================================================
     PUBLIC PDF URL
  ======================================================= */

  function getPublicUrl(path: string) {
    const { data } = supabase.storage
      .from("previous-year-papers")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /* =======================================================
     FILE SIZE
  ======================================================= */

  function formatSize(
    size: number | null
  ) {
    if (!size) {
      return "-";
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(
        1
      )} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredPapers = papers.filter(
    (paper) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return true;
      }

      return (
        paper.title
          .toLowerCase()
          .includes(query) ||
        paper.exam_name
          .toLowerCase()
          .includes(query) ||
        String(paper.year).includes(query) ||
        paper.subject
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardShell role="admin">
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                <FileText
                  size={23}
                  className="text-[#063B8F]"
                />

              </div>

              <div>

                <h1 className="text-2xl font-extrabold text-slate-900">
                  Previous Year Papers
                </h1>

                <p className="text-sm text-slate-500">
                  Manage previous year question papers.
                </p>

              </div>

            </div>

          </div>

          <Link
            href="/dashboard/admin/previous-year-papers/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            <Plus size={18} />
            Upload PDF
          </Link>

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
              placeholder="Search exam, year, subject..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">

              <Loader2
                size={24}
                className="animate-spin text-[#063B8F]"
              />

            </div>
          ) : filteredPapers.length ===
            0 ? (

            /* EMPTY */

            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

              <FileText
                size={40}
                className="text-slate-300"
              />

              <h3 className="mt-4 font-bold text-slate-800">
                No papers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload your first previous year
                question paper.
              </p>

            </div>
          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase text-slate-500">
                      Paper
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase text-slate-500">
                      Exam
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase text-slate-500">
                      Year
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase text-slate-500">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase text-slate-500">
                      File
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-extrabold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPapers.map(
                    (paper) => (
                      <tr
                        key={paper.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        {/* =================================
                            PAPER
                        ================================= */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">

                              <FileText
                                size={19}
                                className="text-red-500"
                              />

                            </div>

                            <div>

                              <p className="font-bold text-slate-900">
                                {paper.title}
                              </p>

                              <p className="text-xs text-slate-400">
                                {paper.file_name}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* =================================
                            EXAM
                        ================================= */}

                        <td className="px-5 py-4">

                          <span className="font-semibold text-slate-700">
                            {paper.exam_name}
                          </span>

                        </td>

                        {/* =================================
                            YEAR
                        ================================= */}

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#063B8F]">

                            <Calendar size={13} />

                            {paper.year}

                          </span>

                        </td>

                        {/* =================================
                            SUBJECT
                        ================================= */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {paper.subject || "-"}

                        </td>

                        {/* =================================
                            FILE SIZE
                        ================================= */}

                        <td className="px-5 py-4">

                          <span className="text-xs font-semibold text-slate-500">
                            {formatSize(
                              paper.file_size
                            )}
                          </span>

                        </td>

                        {/* =================================
                            ACTIONS
                        ================================= */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {/* VIEW PDF */}

                            <a
                              href={getPublicUrl(
                                paper.file_path
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[#063B8F] hover:bg-blue-100"
                              title="View PDF"
                            >

                              <ExternalLink
                                size={16}
                              />

                            </a>

                            {/* ACCESS DETAILS */}

                            <Link
                              href={`/dashboard/admin/previous-year-papers/${paper.id}/accesses`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                              title="View Access Details"
                            >

                              <Users
                                size={16}
                              />

                            </Link>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                deletePaper(
                                  paper
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

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

      </div>
    </DashboardShell>
  );
}