import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
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

type Series = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  exam_name: string;
  category: string;
  image_url: string | null;
  is_free: boolean;
  price: number;
  original_price: number;
  validity_days: number;
  status: string;
};

type SeriesTest = {
  id: string;
  series_id: string;
  test_id: string;
  section_name: string | null;
  test_order: number;
  is_free_preview: boolean;
};

type MockTest = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  exam_name: string;
  category: string;
  is_free: boolean;
  price: number;
  attempt_limit: number;
  time_limit_minutes: number;
  status: string;
};

type Subject = {
  id: string;
  name: string;
  subject_order: number;
};

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString('en-IN');
}

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

function getDiscountPercentage(
  price: number,
  originalPrice: number,
) {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100,
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { data: series } = await supabaseAdmin
    .from('mock_test_series')
    .select(`
      slug,
      title,
      description,
      exam_name,
      category
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!series) {
    return {
      title: 'Mock Test Series | LearnPathshala',
    };
  }

  return {
    title: `${series.title} | LearnPathshala`,
    description:
      series.description ||
      `Practice ${series.exam_name} mock tests with LearnPathshala.`,
    keywords: [
      series.title,
      `${series.exam_name} mock tests`,
      `${series.exam_name} test series`,
      'LearnPathshala',
      'online mock tests',
      'competitive exam preparation',
    ],
    openGraph: {
      title: `${series.title} | LearnPathshala`,
      description:
        series.description ||
        `Practice ${series.exam_name} mock tests with LearnPathshala.`,
      type: 'website',
      siteName: 'LearnPathshala',
    },
  };
}

export default async function MockTestSeriesPage({
  params,
}: PageProps) {
  /*
   * ============================================================
   * FETCH SERIES BY SLUG
   * ============================================================
   */

  const { data: seriesData, error: seriesError } =
    await supabaseAdmin
      .from('mock_test_series')
      .select(`
        id,
        slug,
        title,
        description,
        exam_name,
        category,
        image_url,
        is_free,
        price,
        original_price,
        validity_days,
        status
      `)
      .eq('slug', params.slug)
      .eq('status', 'published')
      .maybeSingle();

  if (seriesError || !seriesData) {
    notFound();
  }

  const series = seriesData as Series;

  /*
   * ============================================================
   * FETCH SERIES -> TEST MAPPING
   * ============================================================
   */

  const { data: mappingData } = await supabaseAdmin
    .from('mock_test_series_tests')
    .select(`
      id,
      series_id,
      test_id,
      section_name,
      test_order,
      is_free_preview
    `)
    .eq('series_id', series.id)
    .order('test_order', {
      ascending: true,
    });

  const mappings = (mappingData || []) as SeriesTest[];

  /*
   * ============================================================
   * FETCH TEST DETAILS
   * ============================================================
   */

  const testIds = mappings.map(
    (item) => item.test_id,
  );

  let tests: MockTest[] = [];

  if (testIds.length > 0) {
    const { data: testsData } = await supabaseAdmin
      .from('mock_tests')
      .select(`
        id,
        slug,
        title,
        description,
        exam_name,
        category,
        is_free,
        price,
        attempt_limit,
        time_limit_minutes,
        status
      `)
      .in('id', testIds)
      .eq('status', 'published');

    tests = (testsData || []) as MockTest[];
  }

  /*
   * ============================================================
   * FETCH SUBJECTS
   * ============================================================
   */

  const { data: subjectsData } = await supabaseAdmin
    .from('mock_test_series_subjects')
    .select(`
      id,
      name,
      subject_order
    `)
    .eq('series_id', series.id)
    .order('subject_order', {
      ascending: true,
    });

  const subjects = (subjectsData || []) as Subject[];

  /*
   * ============================================================
   * PREPARE DATA
   * ============================================================
   */

  const testMap = new Map(
    tests.map((test) => [test.id, test]),
  );

  const orderedTests = mappings
    .map((mapping) => ({
      mapping,
      test: testMap.get(mapping.test_id),
    }))
    .filter(
      (
        item,
      ): item is {
        mapping: SeriesTest;
        test: MockTest;
      } => Boolean(item.test),
    );

  const discountPercentage =
    getDiscountPercentage(
      Number(series.price),
      Number(series.original_price),
    );

  const totalTests = orderedTests.length;

  const totalDuration = orderedTests.reduce(
    (total, item) =>
      total +
      Number(
        item.test.time_limit_minutes || 0,
      ),
    0,
  );

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}

      <section className="relative overflow-hidden bg-[#063B8F]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.22),transparent_35%)]" />

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
                  {series.exam_name}
                </span>

                <span className="inline-flex items-center rounded-full bg-[#F5A623] px-3 py-1.5 text-xs font-bold text-[#063B8F]">
                  {series.category}
                </span>

                {series.is_free && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">
                    FREE
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {series.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg">
                {series.description ||
                  `Prepare for ${series.exam_name} with exam-level mock tests designed to improve your speed, accuracy and confidence.`}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={
                    <FileText className="h-5 w-5" />
                  }
                  value={String(totalTests)}
                  label="Mock Tests"
                />

                <Stat
                  icon={
                    <Layers3 className="h-5 w-5" />
                  }
                  value={String(subjects.length)}
                  label="Subjects"
                />

                <Stat
                  icon={
                    <Clock3 className="h-5 w-5" />
                  }
                  value={`${Math.round(
                    totalDuration / 60,
                  )}h`}
                  label="Test Time"
                />

                <Stat
                  icon={
                    <Target className="h-5 w-5" />
                  }
                  value={String(
                    series.validity_days,
                  )}
                  label="Days Validity"
                />
              </div>
            </div>

            {/* PRICE CARD */}

            <div className="rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex h-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50">
                {series.image_url ? (
                  <img
                    src={series.image_url}
                    alt={series.title}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#063B8F]">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>

                    <span className="font-bold text-[#063B8F]">
                      LearnPathshala
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Test Series Price
                </p>

                {series.is_free ? (
                  <div className="mt-1 text-3xl font-extrabold text-emerald-600">
                    FREE
                  </div>
                ) : (
                  <div className="mt-1 flex items-end gap-3">
                    <span className="text-3xl font-extrabold text-[#063B8F]">
                      ₹
                      {formatPrice(
                        Number(series.price),
                      )}
                    </span>

                    {Number(
                      series.original_price,
                    ) >
                      Number(series.price) && (
                      <>
                        <span className="pb-1 text-sm text-slate-400 line-through">
                          ₹
                          {formatPrice(
                            Number(
                              series.original_price,
                            ),
                          )}
                        </span>

                        {discountPercentage > 0 && (
                          <span className="mb-1 rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                            {discountPercentage}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div className="space-y-3 text-sm">
                <InfoRow
                  label="Validity"
                  value={`${series.validity_days} days`}
                />

                <InfoRow
                  label="Mock Tests"
                  value={String(totalTests)}
                />

                <InfoRow
                  label="Subjects"
                  value={String(
                    subjects.length,
                  )}
                />
              </div>

              <Link
                href={`/login?redirect=/mock-tests/series/${series.slug}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 py-3.5 text-sm font-bold text-[#063B8F] shadow-lg shadow-amber-500/20 transition hover:bg-[#FFB52E]"
              >
                {series.is_free
                  ? 'Start Series'
                  : 'Buy Test Series'}

                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Secure & reliable exam practice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* MAIN */}

          <div className="space-y-8">
            {/* WHAT YOU GET */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#063B8F]">
                  <Sparkles className="h-4 w-4" />
                  What you get
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Complete Mock Test Series
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Practice with the tests included
                  in this series and track your
                  preparation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Feature
                  icon={
                    <Target className="h-5 w-5" />
                  }
                  title="Exam-focused tests"
                  description="Practice with tests designed around the selected exam."
                />

                <Feature
                  icon={
                    <Clock3 className="h-5 w-5" />
                  }
                  title="Timed practice"
                  description="Improve your speed and time management."
                />

                <Feature
                  icon={
                    <Trophy className="h-5 w-5" />
                  }
                  title="Performance practice"
                  description="Attempt tests and identify areas that need improvement."
                />

                <Feature
                  icon={
                    <BookOpen className="h-5 w-5" />
                  }
                  title="Multiple subjects"
                  description="Practice across the subjects included in the series."
                />
              </div>
            </section>

            {/* SUBJECTS */}

            {subjects.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Subjects Covered
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Subjects included in this test
                    series.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {subjects.map(
                    (subject, index) => (
                      <div
                        key={subject.id}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#063B8F]">
                          {index + 1}
                        </div>

                        <span className="font-semibold text-slate-800">
                          {subject.name}
                        </span>

                        <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* TEST LIST */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <FileText className="h-4 w-4" />
                  Test List
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Tests Included
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {totalTests} test
                  {totalTests !== 1 ? 's' : ''}{' '}
                  included in this series.
                </p>
              </div>

              {orderedTests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No tests available yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Tests will appear here when
                    they are published.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderedTests.map(
                    ({ mapping, test }, index) => {
                      const preview =
                        mapping.is_free_preview ||
                        test.is_free;

                      return (
                        <div
                          key={mapping.id}
                          className="group rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                        >
                          <div className="flex gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#063B8F] text-sm font-bold text-white">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-slate-900">
                                  {test.title}
                                </h3>

                                {preview && (
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700">
                                    FREE PREVIEW
                                  </span>
                                )}

                                {!preview && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                    <Lock className="h-3 w-3" />
                                    Premium
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                {test.description ||
                                  'Practice this mock test and improve your exam preparation.'}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock3 className="h-3.5 w-3.5" />

                                  {formatDuration(
                                    test.time_limit_minutes,
                                  )}
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                  <Target className="h-3.5 w-3.5" />

                                  {test.attempt_limit}{' '}
                                  attempt
                                  {test.attempt_limit !==
                                  1
                                    ? 's'
                                    : ''}
                                </span>

                                {mapping.section_name && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Layers3 className="h-3.5 w-3.5" />

                                    {
                                      mapping.section_name
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="hidden shrink-0 sm:block">
                              {preview ? (
                                <Link
                                  href={`/mock-tests/${test.slug}`}
                                  className="inline-flex items-center gap-2 rounded-xl border border-[#063B8F] px-4 py-2.5 text-sm font-bold text-[#063B8F] transition hover:bg-[#063B8F] hover:text-white"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  Preview
                                </Link>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                  <Lock className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 sm:hidden">
                            {preview ? (
                              <Link
                                href={`/mock-tests/${test.slug}`}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#063B8F] px-4 py-2.5 text-sm font-bold text-[#063B8F]"
                              >
                                <PlayCircle className="h-4 w-4" />
                                Preview Test
                              </Link>
                            ) : (
                              <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
                                <Lock className="h-4 w-4" />
                                Included with Series
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR */}

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900">
                Series Summary
              </h3>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  icon={
                    <FileText className="h-4 w-4" />
                  }
                  label="Total Tests"
                  value={String(totalTests)}
                />

                <SummaryRow
                  icon={
                    <Layers3 className="h-4 w-4" />
                  }
                  label="Subjects"
                  value={String(
                    subjects.length,
                  )}
                />

                <SummaryRow
                  icon={
                    <Clock3 className="h-4 w-4" />
                  }
                  label="Total Test Time"
                  value={`${Math.round(
                    totalDuration / 60,
                  )} hrs`}
                />

                <SummaryRow
                  icon={
                    <ShieldCheck className="h-4 w-4" />
                  }
                  label="Validity"
                  value={`${series.validity_days} days`}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#063B8F] to-[#0B63CE] p-6 text-white shadow-lg">
              <Sparkles className="h-7 w-7 text-[#FFB52E]" />

              <h3 className="mt-4 text-xl font-extrabold">
                Ready to start?
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Start practicing and build your
                exam confidence with this complete
                mock test series.
              </p>

              <Link
                href={`/login?redirect=/mock-tests/series/${series.slug}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 py-3 font-bold text-[#063B8F] transition hover:bg-[#FFB52E]"
              >
                {series.is_free
                  ? 'Start Now'
                  : 'Get Full Access'}

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900">
                    Secure Learning
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your test access and progress are
                    securely managed through
                    LearnPathshala.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* BOTTOM CTA */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <GraduationCap className="h-7 w-7 text-[#063B8F]" />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Prepare smarter with LearnPathshala
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Practice regularly, improve your speed
            and identify the areas where you need
            more preparation.
          </p>

          <Link
            href="/mock-tests"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-6 py-3 font-bold text-white transition hover:bg-[#0B63CE]"
          >
            Explore More Mock Tests
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
 * STAT
 * ============================================================ */

function Stat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="mb-2 text-[#FFB52E]">
        {icon}
      </div>

      <p className="text-2xl font-bold text-white">
        {value}
      </p>

      <p className="text-xs text-blue-100">
        {label}
      </p>
    </div>
  );
}

/* ============================================================
 * INFO ROW
 * ============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
 * FEATURE
 * ============================================================ */

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
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

/* ============================================================
 * SUMMARY ROW
 * ============================================================ */

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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