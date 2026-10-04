import type { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

/* ============================================================
   SEO METADATA
============================================================ */

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | LearnPathshala',

  description:
    'Read the LearnPathshala Refund and Cancellation Policy for paid courses, free courses, mock tests, quizzes, discounted courses and course cancellations.',

  keywords: [
    'LearnPathshala refund policy',
    'LearnPathshala cancellation policy',
    'refund policy',
    'course refund policy',
    'online course cancellation',
    'mock test refund',
    'quiz refund',
    'education platform refund',
    'LearnPathshala payment refund',
  ],

  openGraph: {
    title: 'Refund & Cancellation Policy | LearnPathshala',

    description:
      'Understand the refund and cancellation rules for LearnPathshala courses, mock tests, quizzes and other paid learning services.',

    type: 'website',

    siteName: 'LearnPathshala',
  },

  robots: {
    index: true,
    follow: true,
  },
};

/* ============================================================
   PAGE
============================================================ */

export default function RefundCancellationPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">

        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#063B8F] shadow-sm">

              <Sparkles className="h-4 w-4 text-[#F5A623]" />

              Payments & Refunds

            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B8F] sm:text-5xl">

              Refund &amp; Cancellation Policy

            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">

              Please review the following terms regarding refunds,
              cancellations and payments for LearnPathshala courses,
              mock tests and quizzes.

            </p>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Last updated: October 2026
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          QUICK SUMMARY
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white py-10">

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-4 sm:grid-cols-3">

            {/* 24 HOURS */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <Clock className="h-6 w-6 text-[#063B8F]" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                24-Hour Window
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Full refund may be available within 24 hours,
                subject to course access conditions.
              </p>

            </div>

            {/* 7 DAYS */}

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

              <CreditCard className="h-6 w-6 text-amber-600" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                7-Day Window
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                A partial refund may be available within 7 days
                depending on course usage.
              </p>

            </div>

            {/* SUPPORT */}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

              <HelpCircle className="h-6 w-6 text-emerald-600" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                Need Help?
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Contact our support team for refund-related
                questions or requests.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          POLICY CONTENT
      ====================================================== */}

      <main className="py-16 sm:py-20">

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

          <div className="space-y-12">

            {/* ==================================================
                1. FREE COURSES
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">

                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    1. Free Courses
                  </h2>

                  <p className="mt-4 leading-8 text-slate-600">

                    Free courses have no cost and therefore no refund
                    applies. You can enroll and unenroll at any time
                    without any financial implications.

                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                2. PAID COURSE REFUNDS
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                    <CreditCard className="h-5 w-5 text-[#063B8F]" />

                  </div>

                  <div className="min-w-0">

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      2. Paid Course Refunds
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">
                      Refund eligibility depends on the time since
                      enrollment and the amount of course content
                      accessed.
                    </p>

                  </div>

                </div>

                <div className="mt-7 space-y-4">

                  {/* 24 HOURS */}

                  <div className="rounded-xl border border-white bg-white p-5 shadow-sm">

                    <div className="flex gap-3">

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <div>

                        <h3 className="font-bold text-slate-800">
                          Within 24 hours of enrollment
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">

                          Full refund is available if you have not
                          accessed more than 10% of the course content.

                        </p>

                      </div>

                    </div>

                  </div>

                  {/* 7 DAYS */}

                  <div className="rounded-xl border border-white bg-white p-5 shadow-sm">

                    <div className="flex gap-3">

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-amber-500" />

                      <div>

                        <h3 className="font-bold text-slate-800">
                          Within 7 days of enrollment
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">

                          50% refund is available if you have accessed
                          less than 30% of the course content.

                        </p>

                      </div>

                    </div>

                  </div>

                  {/* AFTER 7 DAYS */}

                  <div className="rounded-xl border border-white bg-white p-5 shadow-sm">

                    <div className="flex gap-3">

                      <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                      <div>

                        <h3 className="font-bold text-slate-800">
                          After 7 days
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">

                          No refund is available once 30% or more of
                          the course content has been accessed.

                        </p>

                      </div>

                    </div>

                  </div>

                  {/* LIVE CLASSES */}

                  <div className="rounded-xl border border-white bg-white p-5 shadow-sm">

                    <div className="flex gap-3">

                      <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                      <div>

                        <h3 className="font-bold text-slate-800">
                          Live classes attended
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">

                          No refund is available for courses where
                          live classes have been attended, regardless
                          of the time frame.

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* ==================================================
                3. HOW TO REQUEST
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                3. How to Request a Refund
              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                To request a refund, please contact us at{' '}

                <a
                  href="mailto:supportlearnpathshala@gmail.com"
                  className="font-semibold text-[#063B8F] hover:underline"
                >
                  supportlearnpathshala@gmail.com
                </a>{' '}

                with your account email, course name and reason
                for the refund request.

              </p>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-5">

                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <p className="text-sm leading-6 text-slate-700">

                  Refunds are processed within 7–10 business days
                  to the original payment method.

                </p>

              </div>

            </section>

            {/* ==================================================
                4. COURSE CANCELLATION BY ADMIN
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <ShieldCheck className="h-5 w-5 text-[#063B8F]" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    4. Course Cancellation by Admin
                  </h2>

                  <p className="mt-4 leading-8 text-slate-600">

                    If a course is unpublished or removed by an
                    administrator after you have enrolled, you will
                    receive a full refund regardless of the refund
                    window. The refund will be processed automatically.

                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                5. MOCK TESTS & QUIZZES
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                    <FileText className="h-5 w-5 text-[#063B8F]" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      5. Mock Tests &amp; Quizzes
                    </h2>

                    <p className="mt-4 leading-8 text-slate-600">

                      Mock test and quiz fees are non-refundable once
                      an attempt has been started. If a test is
                      unpublished before you take it, you will receive
                      a full refund or the ability to take a replacement
                      test.

                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* ==================================================
                6. TEACHER EARNINGS
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                6. Teacher Earnings
              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                Teacher earnings are calculated at the time of
                enrollment based on the final price paid by the
                student. If a refund is issued, the corresponding
                teacher earnings will be adjusted accordingly.

              </p>

            </section>

            {/* ==================================================
                7. DISCOUNTED COURSES
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                7. Discounted Courses
              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                Courses purchased at a discounted price are eligible
                for refunds based on the discounted price paid, not
                the original price. The same refund windows apply.

              </p>

            </section>

            {/* ==================================================
                8. NON-REFUNDABLE CASES
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                    <XCircle className="h-5 w-5 text-red-500" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      8. Non-Refundable Cases
                    </h2>

                    <p className="mt-3 leading-7 text-slate-600">
                      Refunds are not available in the following
                      cases:
                    </p>

                  </div>

                </div>

                <ul className="mt-6 space-y-4">

                  <li className="flex gap-3">

                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                    <span className="leading-7 text-slate-600">
                      Courses where more than 30% of content has
                      been accessed.
                    </span>

                  </li>

                  <li className="flex gap-3">

                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                    <span className="leading-7 text-slate-600">
                      Mock tests where at least one attempt has
                      been submitted.
                    </span>

                  </li>

                  <li className="flex gap-3">

                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                    <span className="leading-7 text-slate-600">
                      Courses where live classes have been attended.
                    </span>

                  </li>

                  <li className="flex gap-3">

                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                    <span className="leading-7 text-slate-600">
                      Account suspension or termination due to
                      policy violations.
                    </span>

                  </li>

                </ul>

              </div>

            </section>

            {/* ==================================================
                9. CONTACT
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">

                    <Mail className="h-5 w-5 text-amber-600" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      9. Contact
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">

                      For refund-related questions, please reach out
                      to us using the contact details below.

                    </p>

                    <div className="mt-4 space-y-2">

                      <a
                        href="mailto:supportlearnpathshala@gmail.com"
                        className="block font-semibold text-[#063B8F] hover:underline"
                      >
                        supportlearnpathshala@gmail.com
                      </a>

                      <a
                        href="tel:+919876543210"
                        className="block font-semibold text-[#063B8F] hover:underline"
                      >
                        +91 8810524651
                      </a>

                    </div>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-16">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

            <GraduationCap className="h-8 w-8 text-[#063B8F]" />

          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
            Have questions about a refund?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">

            If you have questions about your payment, refund
            eligibility or cancellation, our support team can help.

          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <Link href="/contact">

              <Button
                size="lg"
                className="
                  h-14
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-[#063B8F]
                  to-[#0B63CE]
                  px-8
                  font-bold
                  text-white
                  shadow-xl
                  shadow-blue-900/20
                  transition-all
                  hover:-translate-y-0.5
                  hover:from-[#052f73]
                  hover:to-[#084fa8]
                  sm:w-auto
                "
              >
                Contact Support

                <ArrowRight className="ml-2 h-5 w-5" />

              </Button>

            </Link>

            <Link href="/courses">

              <Button
                size="lg"
                variant="outline"
                className="
                  h-14
                  w-full
                  rounded-xl
                  border-2
                  border-[#063B8F]/25
                  bg-white
                  px-8
                  font-bold
                  text-[#063B8F]
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-[#F5A623]
                  hover:bg-amber-50
                  hover:text-[#063B8F]
                  focus:text-[#063B8F]
                  sm:w-auto
                "
              >
                Browse Courses

              </Button>

            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}