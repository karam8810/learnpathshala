"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

export default function UploadPreviousYearPaperPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [examName, setExamName] = useState("");
  const [year, setYear] = useState(
    new Date().getFullYear().toString()
  );
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     FILE SELECT
  ========================================================= */

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    /*
     * 20 MB limit
     */

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("PDF size must be less than 20 MB.");
      return;
    }

    setFile(selectedFile);
  }

  /* =========================================================
     UPLOAD
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a paper title.");
      return;
    }

    if (!examName.trim()) {
      setError("Please enter the exam name.");
      return;
    }

    if (!year) {
      setError("Please enter the year.");
      return;
    }

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);

      /* -----------------------------------------------------
         USER
      ----------------------------------------------------- */

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error(
          "You must be logged in as an admin."
        );
      }

      /* -----------------------------------------------------
         FILE NAME
      ----------------------------------------------------- */

      const safeExamName = examName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const safeFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-");

      const uniqueFileName = `${Date.now()}-${safeFileName}`;

      const filePath = `${safeExamName}/${year}/${uniqueFileName}`;

      /* -----------------------------------------------------
         STORAGE UPLOAD
      ----------------------------------------------------- */

      const { error: uploadError } =
        await supabase.storage
          .from("previous-year-papers")
          .upload(filePath, file, {
            contentType: "application/pdf",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      /* -----------------------------------------------------
         DATABASE
      ----------------------------------------------------- */

      const { error: dbError } = await supabase
        .from("previous_year_papers")
        .insert({
          title: title.trim(),
          exam_name: examName.trim(),
          year: Number(year),
          subject: subject.trim() || null,
          description: description.trim() || null,

          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,

          is_published: true,

          uploaded_by: userData.user.id,
        });

      if (dbError) {
        /*
         * If DB insertion fails, remove uploaded file
         * so we don't leave an orphan PDF.
         */

        await supabase.storage
          .from("previous-year-papers")
          .remove([filePath]);

        throw dbError;
      }

      router.push(
        "/dashboard/admin/previous-year-papers"
      );

      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload paper."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/previous-year-papers"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Upload Previous Year Paper
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Upload a previous year question paper PDF.
            </p>
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >

          {/* Title */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Paper Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="SSC CGL Tier 1 Question Paper 2025"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Exam + Year */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Exam Name *
              </label>

              <input
                type="text"
                value={examName}
                onChange={(event) =>
                  setExamName(event.target.value)
                }
                placeholder="SSC CGL"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Year *
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) =>
                  setYear(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Subject */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="General Awareness"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              placeholder="Short description of this question paper..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* PDF */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Question Paper PDF *
            </label>

            {!file ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <Upload
                    size={25}
                    className="text-red-500"
                  />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-800">
                  Click to upload PDF
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PDF only • Maximum 20 MB
                </p>

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <FileText
                      size={21}
                      className="text-red-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(
                        2
                      )}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-red-600"
                >
                  <X size={18} />
                </button>

              </div>
            )}
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Uploading PDF...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Previous Year Paper
              </>
            )}
          </button>

        </form>
      </div>
    </DashboardShell>
  );
}