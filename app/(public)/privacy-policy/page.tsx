import type { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  UserCheck,
  Database,
  Mail,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

/* ============================================================
   SEO METADATA
============================================================ */

export const metadata: Metadata = {
  title: 'Privacy Policy | LearnPathshala',

  description:
    'Read the LearnPathshala Privacy Policy to understand how we collect, use, protect and manage personal information when you use our online learning platform.',

  keywords: [
    'LearnPathshala privacy policy',
    'privacy policy',
    'LearnPathshala data privacy',
    'student data privacy',
    'online education privacy',
    'learning platform privacy',
    'student information',
    'data security',
  ],

  openGraph: {
    title: 'Privacy Policy | LearnPathshala',
    description:
      'Learn how LearnPathshala collects, uses and protects information when you use our online learning platform.',
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

export default function PrivacyPolicyPage() {
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

              <ShieldCheck className="h-4 w-4 text-[#F5A623]" />

              Your Privacy Matters

            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B8F] sm:text-5xl">

              Privacy Policy

            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">

              This Privacy Policy explains how LearnPathshala
              collects, uses and safeguards your information when
              you use our online learning platform.

            </p>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Last updated: October 2026
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          QUICK PRIVACY POINTS
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white py-10">

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <ShieldCheck className="h-6 w-6 text-[#063B8F]" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                Data Protection
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                We take reasonable measures to protect your
                information.
              </p>

            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

              <UserCheck className="h-6 w-6 text-emerald-600" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                Your Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                You can request access, correction or deletion of
                your information.
              </p>

            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

              <Lock className="h-6 w-6 text-amber-600" />

              <h2 className="mt-3 font-bold text-[#063B8F]">
                Secure Access
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Account access is protected through authentication
                and role-based controls.
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
                1. INTRODUCTION
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <ShieldCheck className="h-5 w-5 text-[#063B8F]" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    1. Introduction
                  </h2>

                  <p className="mt-4 leading-8 text-slate-600">

                    LearnPathshala (&quot;we&quot;, &quot;us&quot;,
                    or &quot;our&quot;) is committed to protecting
                    your privacy. This Privacy Policy explains how
                    we collect, use and safeguard your personal
                    information when you use our platform.

                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                2. INFORMATION WE COLLECT
            ================================================== */}

            <section>

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <Database className="h-5 w-5 text-[#063B8F]" />

                </div>

                <div className="min-w-0">

                  <h2 className="text-2xl font-bold text-[#063B8F]">
                    2. Information We Collect
                  </h2>

                  <p className="mt-4 leading-8 text-slate-600">
                    We collect the following types of information:
                  </p>

                  <ul className="mt-5 space-y-4">

                    <li className="flex gap-3 text-slate-600">

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <span className="leading-7">
                        <strong className="text-slate-800">
                          Account information:
                        </strong>{' '}
                        Name, email address and role
                        (student, teacher or admin) when you
                        create an account.
                      </span>

                    </li>

                    <li className="flex gap-3 text-slate-600">

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <span className="leading-7">
                        <strong className="text-slate-800">
                          Profile data:
                        </strong>{' '}
                        Any additional information you choose to
                        add to your profile.
                      </span>

                    </li>

                    <li className="flex gap-3 text-slate-600">

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <span className="leading-7">
                        <strong className="text-slate-800">
                          Activity data:
                        </strong>{' '}
                        Course enrollments, quiz submissions,
                        mock test attempts and learning progress.
                      </span>

                    </li>

                    <li className="flex gap-3 text-slate-600">

                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                      <span className="leading-7">
                        <strong className="text-slate-800">
                          Communication data:
                        </strong>{' '}
                        Messages you send through our contact form
                        or support channels.
                      </span>

                    </li>

                  </ul>

                </div>

              </div>

            </section>

            {/* ==================================================
                3. HOW WE USE INFORMATION
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                3. How We Use Your Information
              </h2>

              <p className="mt-4 leading-8 text-slate-600">
                We may use the information we collect for the
                following purposes:
              </p>

              <ul className="mt-5 space-y-3">

                {[
                  'To provide and maintain the platform and its features.',
                  'To manage your account and provide role-based access.',
                  'To track your learning progress, quiz scores and mock test results.',
                  'To communicate with you about updates, announcements and support.',
                  'To improve our services and develop new features.',
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
                4. DATA SECURITY
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                4. Data Security
              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                We implement industry-standard security measures
                to protect your data, including encrypted
                authentication, role-based access control and
                secure database storage. However, no method of
                transmission over the internet is 100% secure.

              </p>

            </section>

            {/* ==================================================
                5. SHARING INFORMATION
            ================================================== */}

            <section>

              <h2 className="text-2xl font-bold text-[#063B8F]">
                5. Sharing of Information
              </h2>

              <p className="mt-4 leading-8 text-slate-600">

                We do not sell, trade or rent your personal
                information to third parties. We may share data
                with service providers who help us operate the
                platform, subject to confidentiality obligations.

              </p>

            </section>

            {/* ==================================================
                6. YOUR RIGHTS
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">

                <h2 className="text-2xl font-bold text-[#063B8F]">
                  6. Your Rights
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  You have the right to:
                </p>

                <ul className="mt-5 space-y-4">

                  <li className="flex gap-3">

                    <UserCheck className="mt-1 h-5 w-5 shrink-0 text-[#063B8F]" />

                    <span className="leading-7 text-slate-600">
                      Access your personal data stored on the
                      platform.
                    </span>

                  </li>

                  <li className="flex gap-3">

                    <UserCheck className="mt-1 h-5 w-5 shrink-0 text-[#063B8F]" />

                    <span className="leading-7 text-slate-600">
                      Request correction of inaccurate information.
                    </span>

                  </li>

                  <li className="flex gap-3">

                    <UserCheck className="mt-1 h-5 w-5 shrink-0 text-[#063B8F]" />

                    <span className="leading-7 text-slate-600">
                      Request deletion of your account and
                      associated data.
                    </span>

                  </li>

                  <li className="flex gap-3">

                    <UserCheck className="mt-1 h-5 w-5 shrink-0 text-[#063B8F]" />

                    <span className="leading-7 text-slate-600">
                      Opt out of promotional communications.
                    </span>

                  </li>

                </ul>

              </div>

            </section>

            {/* ==================================================
                7. CONTACT
            ================================================== */}

            <section>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">

                    <Mail className="h-5 w-5 text-amber-600" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-[#063B8F]">
                      7. Contact Us
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">

                      If you have questions about this Privacy
                      Policy, please contact us at:

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
            Have questions about your privacy?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">

            If you have any questions about how LearnPathshala
            handles your information, our support team is available
            to help.

          </p>

          <Link href="/contact">

            <Button
              size="lg"
              className="
                mt-8
                h-14
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
              "
            >

              Contact Us

              <ArrowRight className="ml-2 h-5 w-5" />

            </Button>

          </Link>

        </div>

      </section>

    </div>
  );
}