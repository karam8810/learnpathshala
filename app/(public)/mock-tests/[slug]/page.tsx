import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

import { supabaseAdmin } from '@/lib/supabase/admin';

type PageProps = {
  params: {
    slug: string;
  };
};
type MockTest = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  exam_name: string;
  category: string;
  status: string;
  is_free: boolean;
  price: number;
  attempt_limit: number;
  time_limit_minutes: number;
  published_at: string | null;
  created_at: string;
};

type MockQuestion = {
  id: string;
  question_order: number;
  question_text: string;
  options: unknown;
  explanation: string | null;
  image_url: string | null;
  points: number;
  solution_video_path: string | null;
};

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

function getOptionCount(options: unknown) {
  if (Array.isArray(options)) {
    return options.length;
  }

  return 0;
}
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { data: test } = await supabaseAdmin
    .from('mock_tests')
    .select(
      `
        slug,
        title,
        description,
        exam_name,
        category
      `,
    )
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!test) {
    return {
      title: 'Mock Test | LearnPathshala',
    };
  }

  return {
    title: `${test.title} | LearnPathshala`,
    description:
      test.description ||
      `Attempt ${test.exam_name} mock test on LearnPathshala.`,
    keywords: [
      test.title,
      `${test.exam_name} mock test`,
      `${test.exam_name} online test`,
      'LearnPathshala',
      'competitive exam mock test',
      'online mock test',
    ],
    openGraph: {
      title: `${test.title} | LearnPathshala`,
      description:
        test.description ||
        `Practice ${test.exam_name} with LearnPathshala.`,
      type: 'website',
      siteName: 'LearnPathshala',
    },
  };
}
export default async function MockTestDetailsPage({
  params,
}: PageProps) {
  /*
   * ============================================================
   * FETCH TEST
   * ============================================================
   */

 const { data: testData, error: testError } =
  await supabaseAdmin
    .from('mock_tests')
    .select(
      `
        id,
        slug,
        title,
        description,
        exam_name,
        category,
        status,
        is_free,
        price,
        attempt_limit,
        time_limit_minutes,
        published_at,
        created_at
      `,
    )
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

if (testError || !testData) {
  notFound();
}

const test = testData as MockTest;

  /*
   * ============================================================
   * FETCH QUESTIONS
   * ============================================================
   *
   * IMPORTANT:
   * We intentionally DO NOT fetch mock_test_answer_keys here.
   *
   * Correct answers must never be exposed on the public page.
   */

  const { data: questionsData } = await supabaseAdmin
    .from('mock_test_questions')
    .select(
      `
        id,
        question_order,
        question_text,
        options,
        explanation,
        image_url,
        points,
        solution_video_path
      `,
    )
    .eq('test_slug', test.slug)
    .order('question_order', { ascending: true });

  const questions =
    (questionsData || []) as MockQuestion[];

  const totalQuestions = questions.length;

  const totalMarks = questions.reduce(
    (sum, question) =>
      sum + Number(question.points || 0),
    0,
  );

  const totalOptions = questions.reduce(
    (sum, question) =>
      sum + getOptionCount(question.options),
    0,
  );

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden bg-[#063B8F]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.22),transparent_35%)]" />

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Back */}

          <Link
            href="/mock-tests"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mock Tests
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
            {/* LEFT */}

            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
                  {test.exam_name}
                </span>

                <span className="rounded-full bg-[#F5A623] px-3 py-1.5 text-xs font-bold text-[#063B8F]">
                  {test.category}
                </span>

                {test.is_free && (
                  <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">
                    FREE
                  </span>
                )}

                {!test.is_free && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
                    <Lock className="h-3 w-3" />
                    PREMIUM
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {test.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg">
                {test.description ||
                  `Practice ${test.exam_name} with this exam-focused mock test and improve your speed, accuracy and confidence.`}
              </p>

              {/* Stats */}

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={
                    <FileQuestion className="h-5 w-5" />
                  }
                  value={String(totalQuestions)}
                  label="Questions"
                />

                <Stat
                  icon={<Trophy className="h-5 w-5" />}
                  value={String(totalMarks)}
                  label="Total Marks"
                />

                <Stat
                  icon={<Clock3 className="h-5 w-5" />}
                  value={formatDuration(
                    test.time_limit_minutes,
                  )}
                  label="Time Limit"
                />

                <Stat
                  icon={<Target className="h-5 w-5" />}
                  value={String(test.attempt_limit)}
                  label="Attempts"
                />
              </div>
            </div>

            {/* ACTION CARD */}

            <div className="rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#063B8F]">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>

                <span className="ml-3 font-bold text-[#063B8F]">
                  LearnPathshala
                </span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500">
                  Mock Test
                </p>

                {test.is_free ? (
                  <div className="mt-1 text-3xl font-extrabold text-emerald-600">
                    FREE
                  </div>
                ) : (
                  <div className="mt-1 text-3xl font-extrabold text-[#063B8F]">
                    ₹
                    {Number(test.price || 0).toLocaleString(
                      'en-IN',
                    )}
                  </div>
                )}
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div className="space-y-3 text-sm">
                <InfoRow
                  label="Questions"
                  value={String(totalQuestions)}
                />

                <InfoRow
                  label="Total Marks"
                  value={String(totalMarks)}
                />

                <InfoRow
                  label="Time Limit"
                  value={formatDuration(
                    test.time_limit_minutes,
                  )}
                />

                <InfoRow
                  label="Attempts"
                  value={String(test.attempt_limit)}
                />
              </div>

              <Link
                href={`/login?redirect=/mock-tests/${test.slug}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 py-3.5 text-sm font-bold text-[#063B8F] shadow-lg shadow-amber-500/20 transition hover:bg-[#FFB52E]"
              >
                {test.is_free
                  ? 'Start Mock Test'
                  : 'Unlock Mock Test'}

                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Secure online test
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* MAIN */}

          <div className="space-y-8">
            {/* TEST OVERVIEW */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#063B8F]">
                  <Sparkles className="h-4 w-4" />
                  Test Overview
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  About this Mock Test
                </h2>
              </div>

              <p className="leading-7 text-slate-600">
                {test.description ||
                  `This mock test is designed to help you practice ${test.exam_name} exam questions in a timed environment.`}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Feature
                  icon={<Clock3 className="h-5 w-5" />}
                  title="Timed Test"
                  description={`Complete the test within ${formatDuration(
                    test.time_limit_minutes,
                  )}.`}
                />

                <Feature
                  icon={<Target className="h-5 w-5" />}
                  title="Exam Practice"
                  description="Practice questions in an exam-focused environment."
                />

                <Feature
                  icon={<Trophy className="h-5 w-5" />}
                  title="Performance"
                  description="Use your test attempts to improve your preparation."
                />

                <Feature
                  icon={<BookOpen className="h-5 w-5" />}
                  title="Question Practice"
                  description={`${totalQuestions} questions are currently available in this test.`}
                />
              </div>
            </section>

            {/* QUESTION PREVIEW */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <FileQuestion className="h-4 w-4" />
                  Question Preview
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Questions in this Test
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Preview the structure of the test before
                  starting.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <FileQuestion className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 font-semibold text-slate-700">
                    Questions are not available yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Please check again later.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.slice(0, 5).map(
                    (question, index) => (
                      <div
                        key={question.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-[#063B8F]">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-6 text-slate-900">
                              {question.question_text}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>
                                {getOptionCount(
                                  question.options,
                                )}{' '}
                                options
                              </span>

                              <span>
                                {question.points} point
                                {question.points !== 1
                                  ? 's'
                                  : ''}
                              </span>
                            </div>
                          </div>

                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                        </div>
                      </div>
                    ),
                  )}

                  {questions.length > 5 && (
                    <div className="rounded-2xl bg-slate-50 p-5 text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        + {questions.length - 5} more
                        questions
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Start the test to access all questions.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR */}

          <aside className="space-y-5">
            {/* SUMMARY */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900">
                Test Summary
              </h3>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  icon={
                    <FileQuestion className="h-4 w-4" />
                  }
                  label="Questions"
                  value={String(totalQuestions)}
                />

                <SummaryRow
                  icon={<Trophy className="h-4 w-4" />}
                  label="Total Marks"
                  value={String(totalMarks)}
                />

                <SummaryRow
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Duration"
                  value={formatDuration(
                    test.time_limit_minutes,
                  )}
                />

                <SummaryRow
                  icon={<Target className="h-4 w-4" />}
                  label="Attempts"
                  value={String(test.attempt_limit)}
                />
              </div>
            </div>

            {/* START CARD */}

            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#063B8F] to-[#0B63CE] p-6 text-white shadow-lg">
              <PlayCircle className="h-8 w-8 text-[#FFB52E]" />

              <h3 className="mt-4 text-xl font-extrabold">
                Ready to attempt?
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Start the mock test and practice under a timed
                exam environment.
              </p>

              <Link
                href={`/login?redirect=/mock-tests/${test.id}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 py-3 font-bold text-[#063B8F] transition hover:bg-[#FFB52E]"
              >
                Start Test
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* SECURITY */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900">
                    Secure Test
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Answer keys are protected and are never
                    exposed on this public preview page.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <GraduationCap className="h-7 w-7 text-[#063B8F]" />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Improve your preparation
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Practice regularly with LearnPathshala mock tests
            and build confidence for your exam.
          </p>

          <Link
            href="/mock-tests"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-6 py-3 font-bold text-white transition hover:bg-[#0B63CE]"
          >
            Explore More Tests
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

/*
 * ============================================================
 * STAT
 * ============================================================
 */

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="mb-2 text-[#FFB52E]">
        {icon}
      </div>

      <p className="text-xl font-bold text-white">
        {value}
      </p>

      <p className="text-xs text-blue-100">
        {label}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * INFO ROW
 * ============================================================
 */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

/*
 * ============================================================
 * FEATURE
 * ============================================================
 */

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#063B8F]">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * SUMMARY ROW
 * ============================================================
 */

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#063B8F]">
          {icon}
        </div>

        <span className="text-sm text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}