"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Edit3,
  FileQuestion,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { supabase } from "@/lib/supabase/client";

import CurrentAffairQuizManager from "@/components/admin/current-affairs/CurrentAffairQuizManager";

type CurrentAffair = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type QuizQuestion = {
  id: string;
  affair_id: string;
  question_order: number;
  question_text: string;
  options: {
    text: string;
  }[];
  correct_answer: number;
  explanation: string | null;
  points: number;
};

export default function CurrentAffairQuizPage() {
  const params = useParams();
  const router = useRouter();

  const affairId = params?.id as string;

  const [affair, setAffair] =
    useState<CurrentAffair | null>(null);

  const [questions, setQuestions] =
    useState<QuizQuestion[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadData() {
    if (!affairId) return;

    setLoading(true);
    setError("");

    try {
      /*
       * -----------------------------------------
       * LOAD CURRENT AFFAIR
       * -----------------------------------------
       */

      const {
        data: affairData,
        error: affairError,
      } = await supabase
        .from("current_affairs")
        .select(
          `
            id,
            title,
            slug,
            status
          `
        )
        .eq("id", affairId)
        .maybeSingle();

      if (affairError) {
        throw affairError;
      }

      if (!affairData) {
        setError(
          "Current affair not found."
        );

        return;
      }

      setAffair(affairData);

      /*
       * -----------------------------------------
       * LOAD QUESTIONS
       * -----------------------------------------
       */

      const {
        data: questionData,
        error: questionError,
      } = await supabase
        .from("current_affair_questions")
        .select(
          `
            id,
            affair_id,
            question_order,
            question_text,
            options,
            correct_answer,
            explanation,
            points
          `
        )
        .eq("affair_id", affairId)
        .order("question_order", {
          ascending: true,
        });

      if (questionError) {
        throw questionError;
      }

      const normalizedQuestions =
        (questionData || []).map(
          (question: any) => ({
            id: question.id,
            affair_id: question.affair_id,
            question_order:
              question.question_order,
            question_text:
              question.question_text,
            options:
              Array.isArray(
                question.options
              )
                ? question.options
                : [],
            correct_answer:
              Number(
                question.correct_answer
              ),
            explanation:
              question.explanation || "",
            points:
              Number(question.points) || 1,
          })
        );

      setQuestions(
        normalizedQuestions
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to load quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [affairId]);

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
      <DashboardShell role="admin">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading quiz...
          </div>
        </div>
      </DashboardShell>
    );
  }

  /*
   * -----------------------------------------
   * ERROR
   * -----------------------------------------
   */

  if (error || !affair) {
    return (
      <DashboardShell role="admin">
        <div className="mx-auto max-w-5xl p-6">

          <Link
            href="/dashboard/admin/current-affairs"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#063B8F]"
          >
            <ArrowLeft size={16} />
            Back to Current Affairs
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error ||
              "Current affair not found."}
          </div>

        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin">
      <div className="min-h-screen bg-slate-50">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-7xl px-6 py-6">

            <Link
              href="/dashboard/admin/current-affairs"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#063B8F]"
            >
              <ArrowLeft size={16} />
              Back to Current Affairs
            </Link>

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#063B8F]">
                    <FileQuestion size={22} />
                  </div>

                  <div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                      Manage Quiz
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Create and manage MCQs for this current affair.
                    </p>

                  </div>

                </div>

                <div className="mt-4">

                  <h2 className="max-w-3xl text-lg font-bold text-slate-800">
                    {affair.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">

                    <span>
                      Questions:{" "}
                      <strong className="text-slate-800">
                        {questions.length}
                      </strong>
                    </span>

                    <span>•</span>

                    <span>
                      Status:{" "}
                      <strong className="text-slate-800">
                        {affair.status}
                      </strong>
                    </span>

                  </div>

                </div>

              </div>

              <div className="flex flex-wrap gap-3">

                <Link
                  href={`/current-affairs/${affair.slug}`}
                  target="_blank"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Preview Article
                </Link>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            QUIZ MANAGER
        ================================================= */}

        <div className="mx-auto max-w-7xl px-6 py-8">

          <CurrentAffairQuizManager
            affairId={affair.id}
            questions={questions}
            onQuestionsChange={setQuestions}
          />

        </div>

      </div>
    </DashboardShell>
  );
}