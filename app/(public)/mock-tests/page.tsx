import type { Metadata } from 'next';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  IndianRupee,
  Layers3,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

import { supabaseAdmin } from '@/lib/supabase/admin';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ============================================================
   SEO
============================================================ */

export const metadata: Metadata = {
  title: 'Mock Tests & Test Series | LearnPathshala',

  description:
    'Practice free mock tests and test series for competitive exams on LearnPathshala. Improve speed, accuracy and exam preparation with online mock tests.',

  keywords: [
    'LearnPathshala mock tests',
    'online mock tests',
    'competitive exam mock tests',
    'SSC mock tests',
    'SSC CGL mock tests',
    'CGL test series',
    'government exam mock tests',
    'online test series',
    'free mock tests',
  ],

  openGraph: {
    title: 'Mock Tests & Test Series | LearnPathshala',

    description:
      'Practice competitive exam mock tests and test series on LearnPathshala.',

    type: 'website',

    siteName: 'LearnPathshala',
  },

  robots: {
    index: true,
    follow: true,
  },
};

/* ============================================================
   TYPES
============================================================ */

type MockTest = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  exam_name: string;
  category: string;
  status: string;
  is_free: boolean;
  price: number | string;
  attempt_limit: number;
  time_limit_minutes: number;
  published_at: string | null;
  created_at: string;
};

type MockSeries = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  exam_name: string;
  category: string;
  image_url: string | null;
  is_free: boolean;
  price: number | string;
  original_price: number | string;
  validity_days: number;
  status: string;
};

type SeriesTest = {
  series_id: string;
  test_id: string;
};

/* ============================================================
   HELPERS
============================================================ */

function formatPrice(
  price: number | string | null | undefined,
) {
  return Number(price || 0).toLocaleString('en-IN');
}

function formatDuration(
  minutes: number | string | null | undefined,
) {
  const value = Number(minutes || 0);

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

/* ============================================================
   PAGE
============================================================ */

export default async function MockTestsPage() {
  /* ==========================================================
     FETCH PUBLISHED MOCK TESTS
  ========================================================== */

  const {
  data: mockTests,
  error: mockTestsError,
} = await supabaseAdmin
  .from('mock_tests')
  .select(`
    id,
    title,
    slug,
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
  `)
  .eq('status', 'published')
  .order('published_at', {
    ascending: false,
    nullsFirst: false,
  });
  /* ==========================================================
     FETCH PUBLISHED TEST SERIES
  ========================================================== */

  const {
  data: series,
  error: seriesError,
} = await supabaseAdmin
  .from('mock_test_series')
  .select(`
    id,
    title,
    slug,
    description,
    exam_name,
    category,
    image_url,
    is_free,
    price,
    original_price,
    validity_days,
    status,
    published_at
  `)
  .eq('status', 'published')
  .order('published_at', {
    ascending: false,
    nullsFirst: false,
  });
  /* ==========================================================
     FETCH SERIES → TEST MAPPING
  ========================================================== */

  const seriesIds = (series || []).map(
    (item) => item.id,
  );

  let seriesTests: SeriesTest[] = [];

  if (seriesIds.length > 0) {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from('mock_test_series_tests')
      .select(`
        series_id,
        test_id
      `)
      .in('series_id', seriesIds);

    if (error) {
      console.error(
        'Series mapping error:',
        error,
      );
    }

    seriesTests = (data || []) as SeriesTest[];
  }

  /* ==========================================================
     ERROR LOGGING
  ========================================================== */

  if (mockTestsError) {
    console.error(
      'Mock tests error:',
      mockTestsError,
    );
  }

  if (seriesError) {
    console.error(
      'Mock series error:',
      seriesError,
    );
  }

  /* ==========================================================
     NORMALIZE DATA
  ========================================================== */

  const allTests =
    (mockTests || []) as MockTest[];

  const testSeries =
    (series || []) as MockSeries[];

  /* ==========================================================
     IMPORTANT
     
     FIND ALL TESTS THAT BELONG TO A PUBLISHED SERIES.

     Because seriesTests was fetched using only published
     series IDs, every test ID in this Set belongs to a
     currently published series.
  ========================================================== */

  const testsInSeries = new Set(
    seriesTests.map(
      (item) => item.test_id,
    ),
  );

  /* ==========================================================
     STANDALONE FREE TESTS

     Show only:

     1. Published
     2. Free
     3. NOT already included in a published series
  ========================================================== */

  const standaloneFreeTests =
    allTests.filter(
      (test) =>
        test.is_free === true &&
        !testsInSeries.has(test.id),
    );

  /* ==========================================================
     SERIES TEST COUNT
  ========================================================== */

  const testCountBySeries =
    new Map<string, number>();

  for (const item of seriesTests) {
    const current =
      testCountBySeries.get(item.series_id) || 0;

    testCountBySeries.set(
      item.series_id,
      current + 1,
    );
  }

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#063B8F] via-[#084DA8] to-[#0B63CE] text-white">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#FFB52E]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="max-w-4xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">

              <Sparkles className="h-4 w-4 text-[#FFB52E]" />

              Learn • Practice • Improve

            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">

              Mock Tests &{' '}

              <span className="text-[#FFB52E]">
                Test Series
              </span>

            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100 sm:text-xl">
              Practice with exam-focused mock tests,
              improve your speed and accuracy, and
              prepare better with LearnPathshala.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">

                <Target className="h-5 w-5 text-[#FFB52E]" />

                <span className="text-sm font-semibold">
                  Exam-focused practice
                </span>

              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">

                <Clock3 className="h-5 w-5 text-[#FFB52E]" />

                <span className="text-sm font-semibold">
                  Timed mock tests
                </span>

              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">

                <Trophy className="h-5 w-5 text-[#FFB52E]" />

                <span className="text-sm font-semibold">
                  Track performance
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="relative z-10 -mt-8">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-4 sm:grid-cols-3">

            {/* FREE TESTS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <FileText className="h-6 w-6 text-[#063B8F]" />

                </div>

                <div>

                  <p className="text-2xl font-extrabold text-[#063B8F]">
                    {standaloneFreeTests.length}
                  </p>

                  <p className="text-sm text-slate-500">
                    Free Mock Tests
                  </p>

                </div>

              </div>

            </div>

            {/* SERIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">

                  <Layers3 className="h-6 w-6 text-[#D98B00]" />

                </div>

                <div>

                  <p className="text-2xl font-extrabold text-[#063B8F]">
                    {testSeries.length}
                  </p>

                  <p className="text-sm text-slate-500">
                    Test Series
                  </p>

                </div>

              </div>

            </div>

            {/* PRACTICE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">

                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />

                </div>

                <div>

                  <p className="text-2xl font-extrabold text-[#063B8F]">
                    Free
                  </p>

                  <p className="text-sm text-slate-500">
                    Practice Available
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TEST SERIES
      ====================================================== */}

      <section className="py-16 lg:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div>

            <p className="text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Complete Preparation
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
              Test Series
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Practice multiple mock tests through
              structured exam-specific test series.
            </p>

          </div>

          {testSeries.length === 0 ? (

            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <Layers3 className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No test series available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Published test series will appear here.
              </p>

            </div>

          ) : (

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {testSeries.map((item) => {

                const testCount =
                  testCountBySeries.get(item.id) || 0;

                const hasDiscount =
                  Number(item.original_price || 0) >
                  Number(item.price || 0);

                return (

                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* IMAGE */}

                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#063B8F] to-[#0B63CE]">

                      {item.image_url ? (

                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center">

                          <GraduationCap className="h-20 w-20 text-white/80" />

                        </div>

                      )}

                      <div className="absolute left-4 top-4">

                        <Badge className="border-0 bg-white text-[#063B8F] shadow-md">

                          {item.exam_name}

                        </Badge>

                      </div>

                      {item.is_free && (

                        <div className="absolute right-4 top-4">

                          <Badge className="border-0 bg-emerald-500 text-white">
                            FREE
                          </Badge>

                        </div>

                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="p-6">

                      <p className="text-xs font-bold uppercase tracking-wide text-[#F5A623]">
                        {item.category}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-xl font-bold text-[#063B8F]">
                        {item.title}
                      </h3>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                        {item.description ||
                          'Complete exam-focused mock test series for your preparation.'}
                      </p>

                      {/* DETAILS */}

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-500">
                            Tests
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {testCount}
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-500">
                            Validity
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {item.validity_days} days
                          </p>

                        </div>

                      </div>

                      {/* PRICE + BUTTON */}

                  <div className="mt-6 flex items-end justify-between gap-4">

  <div>

    {item.is_free ? (

      <span className="text-2xl font-extrabold text-emerald-600">
        Free
      </span>

    ) : (

      <div>

        {hasDiscount && (
          <div className="text-sm text-slate-400 line-through">
            ₹
            {formatPrice(item.original_price)}
          </div>
        )}

        <div className="flex items-center text-2xl font-extrabold text-[#063B8F]">

          <IndianRupee className="h-5 w-5" />

          {formatPrice(item.price)}

        </div>

      </div>

    )}

  </div>

  <Link
    href={
      item.slug
        ? `/mock-tests/series/${item.slug}`
        : '#'
    }
  >

    <Button
      disabled={!item.slug}
      className="bg-gradient-to-r from-[#063B8F] to-[#0B63CE] font-semibold text-white hover:from-[#052f73] hover:to-[#084fa8]"
    >

      View Series

      <ArrowRight className="ml-2 h-4 w-4" />

    </Button>

  </Link>

</div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          STANDALONE FREE MOCK TESTS
      ====================================================== */}

      <section className="bg-white py-16 lg:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div>

            <p className="text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Practice Now
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
              Free Mock Tests
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Practice individual free mock tests that
              are not already included in a test series.
            </p>

          </div>

          {standaloneFreeTests.length === 0 ? (

            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">

              <FileText className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No standalone free mock tests available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Free tests that are not part of a test
                series will appear here.
              </p>

            </div>

          ) : (

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {standaloneFreeTests.map((test) => (

                <div
                  key={test.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                      <FileText className="h-6 w-6 text-[#063B8F]" />

                    </div>

                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      FREE
                    </Badge>

                  </div>

                  {/* CONTENT */}

                  <div className="mt-5">

                    <p className="text-xs font-bold uppercase tracking-wide text-[#F5A623]">
                      {test.exam_name}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-xl font-bold text-[#063B8F]">
                      {test.title}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {test.description ||
                        'Practice this mock test and evaluate your exam preparation.'}
                    </p>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-6 grid grid-cols-2 gap-3">

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">

                      <Clock3 className="h-4 w-4 text-[#063B8F]" />

                      <div>

                        <p className="text-[11px] text-slate-500">
                          Duration
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          {formatDuration(
                            test.time_limit_minutes,
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">

                      <Target className="h-4 w-4 text-[#063B8F]" />

                      <div>

                        <p className="text-[11px] text-slate-500">
                          Attempts
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          {test.attempt_limit}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* FOOTER */}

               <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

  <div className="flex items-center gap-2 text-xs text-slate-500">

    <BookOpen className="h-4 w-4" />

    {test.category}

  </div>

  <Link
    href={
      test.slug
        ? `/mock-tests/${test.slug}`
        : '#'
    }
  >

    <Button
      disabled={!test.slug}
      variant="outline"
      className="border-[#063B8F]/20 bg-white font-semibold text-[#063B8F] hover:border-[#F5A623] hover:bg-amber-50 hover:text-[#063B8F]"
    >

      Start Test

      <ArrowRight className="ml-2 h-4 w-4" />

    </Button>

  </Link>

</div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="bg-slate-50 py-16 lg:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Simple Process
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
              Prepare in 3 simple steps
            </h2>

            <p className="mt-4 text-slate-600">
              Choose your test, complete the exam
              and review your performance.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {[
              {
                icon: BookOpen,
                number: '01',
                title: 'Choose a Test',
                description:
                  'Select a standalone free mock test or explore a complete test series.',
              },
              {
                icon: Clock3,
                number: '02',
                title: 'Take the Test',
                description:
                  'Attempt questions within the configured exam time limit.',
              },
              {
                icon: Trophy,
                number: '03',
                title: 'Check Performance',
                description:
                  'Review your score and performance after completing the test.',
              },
            ].map((step) => {

              const Icon = step.icon;

              return (

                <div
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#063B8F]">

                      <Icon className="h-6 w-6 text-white" />

                    </div>

                    <span className="text-4xl font-black text-slate-100">
                      {step.number}
                    </span>

                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#063B8F]">
                    {step.title}
                  </h3>

                  <p className="mt-2 leading-6 text-slate-600">
                    {step.description}
                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-16">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

            <GraduationCap className="h-8 w-8 text-[#063B8F]" />

          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
            Ready to start your preparation?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Practice regularly and keep improving your
            exam preparation with LearnPathshala.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <Link href="/register">

              <Button
                size="lg"
                className="h-14 w-full rounded-xl bg-gradient-to-r from-[#063B8F] to-[#0B63CE] px-8 font-bold text-white hover:from-[#052f73] hover:to-[#084fa8] sm:w-auto"
              >

                Create Free Account

                <ArrowRight className="ml-2 h-5 w-5" />

              </Button>

            </Link>

            <Link href="/courses">

              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-xl border-2 border-[#063B8F]/20 bg-white px-8 font-bold text-[#063B8F] hover:border-[#F5A623] hover:bg-amber-50 hover:text-[#063B8F] sm:w-auto"
              >

                Explore Courses

              </Button>

            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}