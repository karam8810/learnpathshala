"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Search,
  BookOpen,
  Filter,
  Loader2,
  Phone,
  User,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

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

type PendingAction = "view" | "download" | null;

/* =========================================================
   COMPONENT
========================================================= */

export default function PreviousYearPapersPage() {
  /* =======================================================
     PAPERS
  ======================================================= */

  const [papers, setPapers] = useState<Paper[]>([]);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] = useState("");

  const [examFilter, setExamFilter] = useState("all");

  const [yearFilter, setYearFilter] = useState("all");

  const [subjectFilter, setSubjectFilter] =
    useState("all");

  /* =======================================================
     ACCESS MODAL
  ======================================================= */

  const [showAccessModal, setShowAccessModal] =
    useState(false);

  const [selectedPaper, setSelectedPaper] =
    useState<Paper | null>(null);

  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);

  /* =======================================================
     ACCESS FORM
  ======================================================= */

  const [accessName, setAccessName] = useState("");

  const [accessPhone, setAccessPhone] = useState("");

  const [accessError, setAccessError] = useState("");

  const [accessLoading, setAccessLoading] =
    useState(false);

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
        .select(`
          id,
          title,
          exam_name,
          year,
          subject,
          description,
          file_name,
          file_path,
          file_size,
          is_published,
          created_at
        `)
        .eq("is_published", true)
        .order("year", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPapers((data || []) as Paper[]);
    } catch (error) {
      console.error(
        "Failed to load previous year papers:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     PUBLIC PDF URL
  ======================================================= */

  function getPdfUrl(filePath: string) {
    const { data } = supabase.storage
      .from("previous-year-papers")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /* =======================================================
     FILTER VALUES
  ======================================================= */

  const exams = useMemo(() => {
    return Array.from(
      new Set(
        papers.map((paper) => paper.exam_name)
      )
    ).sort();
  }, [papers]);

  const years = useMemo(() => {
    return Array.from(
      new Set(papers.map((paper) => paper.year))
    ).sort((a, b) => b - a);
  }, [papers]);

  const subjects = useMemo(() => {
    return Array.from(
      new Set(
        papers
          .map((paper) => paper.subject)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [papers]);

  /* =======================================================
     FILTER PAPERS
  ======================================================= */

  const filteredPapers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return papers.filter((paper) => {
      const matchesSearch =
        !query ||
        paper.title
          .toLowerCase()
          .includes(query) ||
        paper.exam_name
          .toLowerCase()
          .includes(query) ||
        String(paper.year).includes(query) ||
        paper.subject
          ?.toLowerCase()
          .includes(query);

      const matchesExam =
        examFilter === "all" ||
        paper.exam_name === examFilter;

      const matchesYear =
        yearFilter === "all" ||
        String(paper.year) === yearFilter;

      const matchesSubject =
        subjectFilter === "all" ||
        paper.subject === subjectFilter;

      return (
        matchesSearch &&
        matchesExam &&
        matchesYear &&
        matchesSubject
      );
    });
  }, [
    papers,
    search,
    examFilter,
    yearFilter,
    subjectFilter,
  ]);

  /* =======================================================
     FILE SIZE
  ======================================================= */

  function formatFileSize(
    size: number | null
  ) {
    if (!size) return "";

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(
      1
    )} MB`;
  }

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  function resetFilters() {
    setSearch("");
    setExamFilter("all");
    setYearFilter("all");
    setSubjectFilter("all");
  }

  const hasFilters =
    Boolean(search) ||
    examFilter !== "all" ||
    yearFilter !== "all" ||
    subjectFilter !== "all";

  /* =======================================================
     OPEN ACCESS MODAL
  ======================================================= */

  function openAccessModal(
    paper: Paper,
    action: "view" | "download"
  ) {
    setSelectedPaper(paper);

    setPendingAction(action);

    setAccessError("");

    setShowAccessModal(true);
  }

  /* =======================================================
     CLOSE ACCESS MODAL
  ======================================================= */

  function closeAccessModal() {
    if (accessLoading) {
      return;
    }

    setShowAccessModal(false);

    setSelectedPaper(null);

    setPendingAction(null);

    setAccessError("");

    setAccessName("");

    setAccessPhone("");
  }

  /* =======================================================
     SUBMIT ACCESS FORM
  ======================================================= */

  async function continueToPaper() {
    setAccessError("");

    const name = accessName.trim();

    const phone = accessPhone.replace(
      /\D/g,
      ""
    );

    /* -------------------------------------------------------
       NAME VALIDATION
    ------------------------------------------------------- */

    if (name.length < 2) {
      setAccessError(
        "Please enter your full name."
      );

      return;
    }

    /* -------------------------------------------------------
       PHONE VALIDATION
    ------------------------------------------------------- */

    if (!/^\d{10}$/.test(phone)) {
      setAccessError(
        "Please enter a valid 10 digit mobile number."
      );

      return;
    }

    /* -------------------------------------------------------
       PAPER VALIDATION
    ------------------------------------------------------- */

    if (!selectedPaper) {
      setAccessError(
        "Question paper information is missing."
      );

      return;
    }

    if (!pendingAction) {
      setAccessError(
        "Please select View or Download again."
      );

      return;
    }

    try {
      setAccessLoading(true);

      /* -----------------------------------------------------
         CURRENT USER
      ----------------------------------------------------- */

      const { data: userData } =
        await supabase.auth.getUser();

      /*
       * Guest users are allowed.
       * user_id will simply be null.
       */

      const userId =
        userData.user?.id || null;

      /* -----------------------------------------------------
         SAVE ACCESS
      ----------------------------------------------------- */

      const { error: accessInsertError } =
        await supabase
          .from("previous_year_paper_accesses")
          .insert({
            paper_id: selectedPaper.id,
            user_id: userId,
            student_name: name,
            phone,
            action: pendingAction,
          });

      if (accessInsertError) {
        console.error(
          "Access insert error:",
          accessInsertError
        );

        throw new Error(
          accessInsertError.message ||
            "Unable to save your details."
        );
      }

      /* -----------------------------------------------------
         GET PDF URL
      ----------------------------------------------------- */

      const pdfUrl = getPdfUrl(
        selectedPaper.file_path
      );

      /* -----------------------------------------------------
         CLOSE MODAL
      ----------------------------------------------------- */

      setShowAccessModal(false);

      setSelectedPaper(null);

      setPendingAction(null);

      setAccessName("");

      setAccessPhone("");

      setAccessError("");

      /* -----------------------------------------------------
         VIEW
      ----------------------------------------------------- */

      if (pendingAction === "view") {
        window.open(
          pdfUrl,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      /* -----------------------------------------------------
         DOWNLOAD
      ----------------------------------------------------- */

      if (pendingAction === "download") {
        const link =
          document.createElement("a");

        link.href = pdfUrl;

        link.download =
          selectedPaper.file_name;

        link.target = "_blank";

        link.rel = "noopener noreferrer";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        return;
      }
    } catch (error) {
      console.error(
        "Paper access error:",
        error
      );

      setAccessError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setAccessLoading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#063B8F] via-blue-700 to-blue-900">

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur">

              <FileText size={31} />

            </div>

            <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Previous Year Papers
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Practice with previous year question
              papers and prepare smarter for your
              competitive exams.
            </p>

          </div>

        </div>

      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="relative z-10 -mt-16 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">

            {/* Search */}

            <div className="relative">

              <Search
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search exam, paper, year..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            {/* Exam */}

            <select
              value={examFilter}
              onChange={(event) =>
                setExamFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="all">
                All Exams
              </option>

              {exams.map((exam) => (
                <option
                  key={exam}
                  value={exam}
                >
                  {exam}
                </option>
              ))}
            </select>

            {/* Year */}

            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="all">
                All Years
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={String(year)}
                >
                  {year}
                </option>
              ))}
            </select>

            {/* Subject */}

            <select
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="all">
                All Subjects
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              ))}
            </select>

          </div>

          {/* Active Filters */}

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">

                <Filter size={15} />

                {filteredPapers.length} paper
                {filteredPapers.length !== 1
                  ? "s"
                  : ""}{" "}
                found

              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[#063B8F] hover:underline"
              >
                Clear Filters
              </button>

            </div>
          )}

        </div>

        {/* =================================================
            RESULT HEADER
        ================================================= */}

        <div className="mt-10 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-extrabold text-slate-900">
              Question Papers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading papers..."
                : `${filteredPapers.length} papers available`}
            </p>

          </div>

          <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-[#063B8F] sm:flex">

            <BookOpen size={15} />

            Practice & Prepare

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">

              <Loader2
                size={22}
                className="animate-spin text-[#063B8F]"
              />

              Loading previous year papers...

            </div>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredPapers.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                <FileText
                  size={28}
                  className="text-slate-400"
                />

              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-800">
                No papers found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Try changing your search or
                filters to find previous year
                question papers.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-[#063B8F] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        {/* =================================================
            PAPER GRID
        ================================================= */}

        {!loading &&
          filteredPapers.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredPapers.map((paper) => {

                return (
                  <article
                    key={paper.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* PDF HEADER */}

                    <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 to-orange-50">

                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-red-100/60" />

                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">

                        <FileText
                          size={31}
                          className="text-red-500"
                        />

                      </div>

                      <span className="absolute right-4 top-4 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                        PDF
                      </span>

                    </div>

                    {/* CONTENT */}

                    <div className="p-5">

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#063B8F]">
                          {paper.exam_name}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">

                          <Calendar size={12} />

                          {paper.year}

                        </span>

                      </div>

                      <h3 className="mt-4 line-clamp-2 text-lg font-extrabold leading-6 text-slate-900">
                        {paper.title}
                      </h3>

                      {paper.subject && (
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          Subject:{" "}
                          <span className="text-slate-700">
                            {paper.subject}
                          </span>
                        </p>
                      )}

                      {paper.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                          {paper.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                        <span className="text-xs font-medium text-slate-400">
                          {formatFileSize(
                            paper.file_size
                          )}
                        </span>

                        <span className="text-xs font-medium text-slate-400">
                          Question Paper
                        </span>

                      </div>

                      {/* BUTTONS */}

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            openAccessModal(
                              paper,
                              "view"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#063B8F] bg-white px-4 py-3 text-sm font-bold text-[#063B8F] transition hover:bg-blue-50"
                        >
                          <ExternalLink
                            size={16}
                          />

                          View PDF
                        </button>

                        {/* DOWNLOAD */}

                        <button
                          type="button"
                          onClick={() =>
                            openAccessModal(
                              paper,
                              "download"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                        >
                          <Download
                            size={16}
                          />

                          Download
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </section>

      {/* ===================================================
          ACCESS MODAL
      =================================================== */}

      {showAccessModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !accessLoading
            ) {
              closeAccessModal();
            }
          }}
        >

          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeAccessModal}
              disabled={accessLoading}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* MODAL HEADER */}

            <div className="bg-gradient-to-r from-[#063B8F] to-blue-700 px-6 py-7 text-white">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">

                <FileText size={27} />

              </div>

              <h2 className="mt-4 text-xl font-extrabold">
                Access Question Paper
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-100">
                Enter your details before accessing
                this question paper.
              </p>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-6">

              {/* SELECTED PAPER */}

              {selectedPaper && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {selectedPaper.exam_name}{" "}
                    •{" "}
                    {selectedPaper.year}
                  </p>

                  <p className="mt-1 text-sm font-extrabold leading-6 text-slate-800">
                    {selectedPaper.title}
                  </p>

                  {selectedPaper.subject && (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {selectedPaper.subject}
                    </p>
                  )}

                </div>
              )}

              {/* NAME */}

              <div>

                <label
                  htmlFor="paper-access-name"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="paper-access-name"
                    type="text"
                    value={accessName}
                    onChange={(event) =>
                      setAccessName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    disabled={accessLoading}
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

              </div>

              {/* PHONE */}

              <div>

                <label
                  htmlFor="paper-access-phone"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Mobile Number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="paper-access-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={accessPhone}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setAccessPhone(
                        value.slice(0, 10)
                      );
                    }}
                    placeholder="Enter 10 digit mobile number"
                    disabled={accessLoading}
                    autoComplete="tel"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  Your name and mobile number are
                  saved with this paper access.
                </p>

              </div>

              {/* ERROR */}

              {accessError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-700">
                  {accessError}
                </div>
              )}

              {/* ACTION */}

              <button
                type="button"
                onClick={continueToPaper}
                disabled={accessLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {accessLoading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Please wait...
                  </>
                ) : pendingAction ===
                  "download" ? (
                  <>
                    <Download size={18} />

                    Continue to Download
                  </>
                ) : (
                  <>
                    <ExternalLink
                      size={18}
                    />

                    Continue to View
                  </>
                )}

              </button>

              <p className="text-center text-[11px] leading-5 text-slate-400">
                By continuing, your details will
                be recorded for this question paper
                access.
              </p>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}