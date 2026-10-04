"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Phone,
  Trophy,
  User,
  Users,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

/* =========================================================
   TYPES
========================================================= */

type Attempt = {
  id: string;
  affair_id: string;
  user_id: string | null;

  student_name: string;
  phone: string;

  score: number;
  total_points: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;

  percentage: number;
  time_taken_seconds: number;

  started_at: string;
  submitted_at: string | null;
  created_at: string;
};

type CurrentAffair = {
  id: string;
  title: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds || 0);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
}

function formatDate(date: string | null) {
  if (!date) return "-";

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

export default function CurrentAffairQuizAttemptsPage() {
  const params = useParams();

  const affairId = String(params.id);

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [affair, setAffair] = useState<CurrentAffair | null>(null);

  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!affairId) return;

    loadData();
  }, [affairId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      /* -----------------------------------------------------
         CURRENT AFFAIR
      ----------------------------------------------------- */

      const {
        data: affairData,
        error: affairError,
      } = await supabase
        .from("current_affairs")
        .select("id, title")
        .eq("id", affairId)
        .single();

      if (affairError) {
        throw affairError;
      }

      setAffair(affairData);

      /* -----------------------------------------------------
         ATTEMPTS
      ----------------------------------------------------- */

      const {
        data: attemptsData,
        error: attemptsError,
      } = await supabase
        .from("current_affair_quiz_attempts")
        .select(`
          id,
          affair_id,
          user_id,
          student_name,
          phone,
          score,
          total_points,
          correct_answers,
          wrong_answers,
          unanswered,
          total_questions,
          percentage,
          time_taken_seconds,
          started_at,
          submitted_at,
          created_at
        `)
        .eq("affair_id", affairId)
        .order("created_at", {
          ascending: false,
        });

      if (attemptsError) {
        throw attemptsError;
      }

      setAttempts((attemptsData || []) as Attempt[]);
    } catch (err) {
      console.error("Failed to load quiz attempts:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load quiz attempts."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredAttempts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return attempts;
    }

    return attempts.filter((attempt) => {
      return (
        attempt.student_name
          ?.toLowerCase()
          .includes(value) ||
        attempt.phone?.includes(value)
      );
    });
  }, [attempts, search]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalAttempts = attempts.length;

  const averagePercentage =
    attempts.length > 0
      ? attempts.reduce(
          (sum, attempt) =>
            sum + Number(attempt.percentage || 0),
          0
        ) / attempts.length
      : 0;

  const highestScore =
    attempts.length > 0
      ? Math.max(
          ...attempts.map((attempt) =>
            Number(attempt.percentage || 0)
          )
        )
      : 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DashboardShell role="admin">
      <div className="space-y-6">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              href={`/dashboard/admin/current-affairs/${affairId}/quiz`}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Users
                  size={22}
                  className="text-[#063B8F]"
                />

                <h1 className="text-2xl font-extrabold text-slate-900">
                  Quiz Attempts
                </h1>
              </div>

              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                {affair?.title || "Current Affairs Quiz"}
              </p>
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

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Attempts
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {totalAttempts}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#063B8F]">
                <Users size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Average %
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {averagePercentage.toFixed(1)}%
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Highest %
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {highestScore.toFixed(1)}%
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Questions
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {attempts[0]?.total_questions || 0}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Trophy size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by student name or mobile number..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading quiz submissions...
              </div>
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Users
                  size={26}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No quiz submissions yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Students who submit this quiz will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Score
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      %
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Correct
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Wrong
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Time
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Submitted
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttempts.map(
                    (attempt, index) => (
                      <tr
                        key={attempt.id}
                        className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50/30"
                        }`}
                      >
                        {/* Student */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-[#063B8F]">
                              {attempt.student_name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>

                            <div>
                              <p className="font-bold text-slate-900">
                                {attempt.student_name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Attempt #{index + 1}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Phone
                              size={15}
                              className="text-slate-400"
                            />

                            {attempt.phone}
                          </div>
                        </td>

                        {/* Score */}

                        <td className="px-5 py-4">
                          <span className="font-extrabold text-slate-900">
                            {attempt.score}
                          </span>

                          <span className="text-slate-400">
                            {" "}
                            / {attempt.total_points}
                          </span>
                        </td>

                        {/* Percentage */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                              Number(attempt.percentage) >=
                              80
                                ? "bg-green-100 text-green-700"
                                : Number(
                                      attempt.percentage
                                    ) >= 50
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Number(
                              attempt.percentage
                            ).toFixed(2)}
                            %
                          </span>
                        </td>

                        {/* Correct */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-green-600">
                            <CheckCircle2 size={16} />

                            {attempt.correct_answers}
                          </div>
                        </td>

                        {/* Wrong */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-red-600">
                            <XCircle size={16} />

                            {attempt.wrong_answers}
                          </div>
                        </td>

                        {/* Time */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                            <Clock3 size={15} />

                            {formatTime(
                              attempt.time_taken_seconds
                            )}
                          </div>
                        </td>

                        {/* Submitted */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <CalendarDays size={15} />

                            {formatDate(
                              attempt.submitted_at
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

        {/* ===================================================
            FOOTER INFO
        =================================================== */}

        {!loading && filteredAttempts.length > 0 && (
          <p className="text-center text-xs text-slate-400">
            Showing {filteredAttempts.length} of{" "}
            {attempts.length} quiz attempts
          </p>
        )}
      </div>
    </DashboardShell>
  );
}