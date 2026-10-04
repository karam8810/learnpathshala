import type { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

/* ============================================================
   SEO METADATA
============================================================ */

export const metadata: Metadata = {
  title: 'Terms & Conditions | LearnPathshala',

  description:
    'Read the LearnPathshala Terms and Conditions covering user accounts, course enrollment, pricing, teacher responsibilities, student responsibilities, content ownership and platform usage.',

  keywords: [
    'LearnPathshala terms and conditions',
    'LearnPathshala terms',
    'terms and conditions',
    'online learning platform terms',
    'course enrollment terms',
    'student terms',
    'teacher terms',
    'online course terms',
    'mock test terms',
    'LearnPathshala policies',
  ],

  openGraph: {
    title: 'Terms & Conditions | LearnPathshala',

    description:
      'Review the Terms and Conditions for using the LearnPathshala online learning platform, courses, mock tests and educational services.',

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

export default function TermsPage() {
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

            {/* Badge */}

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#063B8F] shadow-sm">

              <Sparkles className="h-4 w-4 text-[#F5A623]" />

              Platform Guidelines

            </div>

            {/* Heading */}

            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B8F] sm:text-5xl">

              Terms &amp; Conditions

            </h1>

            {/* Description */}

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">

              Please review the terms and conditions that apply
              when using LearnPathshala, including our courses,
              mock tests, accounts and educational services.

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

            {/* ACCOUNT */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <UserCheck className="h-6 w-6 text-[#063B8F]" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                User Accounts
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep your account information accurate and your
                login credentials secure.
              </p>

            </div>

            {/* COURSES */}

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

              <BookOpen className="h-6 w-6 text-amber-600" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                Courses & Learning
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Understand the rules around courses, enrollment,
                pricing and educational content.
              </p>

            </div>

            {/* RESPONSIBLE USE */}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

              <ShieldCheck className="h-6 w-6 text-emerald-600" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                Responsible Use
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Use LearnPathshala responsibly and respect platform
                rules and educational content.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          TERMS CONTENT
      ====================================================== */}

      <main className="py-16 sm:py-20">

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

          <div className="space-y-12">

            {/* ==================================================
                1. ACCEPTANCE
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <FileText className="h-5 w-5 text-[#063B8F]" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    1. Acceptance of Terms
                  </h2>

                  <p className="mt-4 leading-8 text-slate-600">

                    By accessing or using LearnPathshala, you agree
                    to be bound by these Terms &amp; Conditions. If
                    you do not agree with any part of these terms,
                    please do not use the platform.

                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                2. USER ACCOUNTS
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                2. User Accounts
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                When creating and using an account on LearnPathshala,
                you agree to the following:
              </p>

              <ul className="mt-5 space-y-4">

                {[
                  'You must provide accurate and complete information when creating an account.',
                  'You are responsible for maintaining the confidentiality of your login credentials.',
                  'You are responsible for all activities performed under your account.',
                  'Accounts are role-based (admin, teacher, student) with specific permissions and restrictions.',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-slate-600"
                  >

                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                    <span className="leading-7">
                      {item}
                    </span>

                  </li>
                ))}

              </ul>

            </section>

            {/* ==================================================
                3. COURSE ENROLLMENT & PRICING
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                    <BookOpen className="h-5 w-5 text-[#063B8F]" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      3. Course Enrollment &amp; Pricing
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">
                      Course enrollment and pricing are managed
                      according to the following rules:
                    </p>

                  </div>

                </div>

                <ul className="mt-6 space-y-4">

                  {[
                    'Teachers set a suggested price for their courses; admins set the final price.',
                    'Students enroll in courses at the displayed price (or discounted price where applicable).',
                    'Free courses can be enrolled in at no cost.',
                    'Admins may apply discounts, set attempt limits and manage course availability.',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3"
                    >

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <span className="leading-7 text-slate-600">
                        {item}
                      </span>

                    </li>
                  ))}

                </ul>

              </div>

            </section>

            {/* ==================================================
                4. TEACHER RESPONSIBILITIES
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">

                  <Users className="h-5 w-5 text-amber-600" />

                </div>

                <div className="min-w-0">

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    4. Teacher Responsibilities
                  </h2>

                  <ul className="mt-5 space-y-4">

                    {[
                      'Teachers can create courses, add content and set suggested prices.',
                      'Teachers cannot publish courses directly; admin approval is required.',
                      'Teachers can create mock tests and submit them for admin review.',
                      'Teachers earn a share of revenue from paid enrollments in their courses.',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex gap-3"
                      >

                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                        <span className="leading-7 text-slate-600">
                          {item}
                        </span>

                      </li>
                    ))}

                  </ul>

                </div>

              </div>

            </section>

            {/* ==================================================
                5. STUDENT RESPONSIBILITIES
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <h2 className="text-2xl font-bold text-[#063B8F]">
                  5. Student Responsibilities
                </h2>

                <ul className="mt-5 space-y-4">

                  {[
                    'Students can enroll in published courses and take mock tests.',
                    'Students must not share account credentials with others.',
                    'Mock test attempt limits are enforced; students cannot exceed the set number of attempts.',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3"
                    >

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <span className="leading-7 text-slate-600">
                        {item}
                      </span>

                    </li>
                  ))}

                </ul>

              </div>

            </section>

            {/* ==================================================
                6. CONTENT OWNERSHIP
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <Lock className="h-5 w-5 text-[#063B8F]" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    6. Content Ownership
                  </h2>

                  <p className="mt-4 leading-8 text-slate-600">

                    All content created on the platform, including
                    courses, questions and mock tests, remains the
                    property of the respective creators.
                    LearnPathshala retains a license to host and
                    display content for educational purposes.

                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                7. PROHIBITED CONDUCT
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                    <AlertTriangle className="h-5 w-5 text-red-500" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      7. Prohibited Conduct
                    </h2>

                    <p className="mt-3 leading-7 text-slate-600">
                      Users must not:
                    </p>

                  </div>

                </div>

                <ul className="mt-6 space-y-4">

                  {[
                    'Attempt to access data or features outside your role permissions.',
                    'Share, copy or distribute course content without permission.',
                    'Attempt to manipulate test scores or rankings.',
                    'Use the platform for any unlawful activities.',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3"
                    >

                      <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-500" />

                      <span className="leading-7 text-slate-600">
                        {item}
                      </span>

                    </li>
                  ))}

                </ul>

              </div>

            </section>

            {/* ==================================================
                8. TERMINATION
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                8. Termination
              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                We reserve the right to suspend or terminate
                accounts that violate these Terms. Admins have the
                authority to remove users, unpublish courses and
                manage platform content.

              </p>

            </section>

            {/* ==================================================
                9. CHANGES TO TERMS
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">

                    <RefreshCw className="h-5 w-5 text-amber-600" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      9. Changes to Terms
                    </h2>

                    <p className="mt-4 leading-8 text-slate-600">

                      We may update these Terms from time to time.
                      Continued use of the platform after changes
                      constitutes acceptance of the updated Terms.

                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* ==================================================
                10. CONTACT
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">

                    <Mail className="h-5 w-5 text-amber-600" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      10. Contact
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">

                      For questions about these Terms, please contact
                      us at:

                    </p>

                    <a
                      href="mailto:supportlearnpathshala@gmail.com"
                      className="mt-3 inline-block font-semibold text-[#063B8F] hover:underline"
                    >
                      supportlearnpathshala@gmail.com
                    </a>

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
            Have questions about our Terms?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">

            If you have questions about using LearnPathshala,
            courses, accounts or any of our platform policies,
            our support team can help.

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
                Contact Us

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