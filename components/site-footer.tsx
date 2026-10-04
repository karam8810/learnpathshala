import Image from "next/image";
import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  Newspaper,
  FileText,
  Layers3,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

/* =========================================================
   LINK DATA
========================================================= */

const platformLinks = [
  {
    label: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    label: "Mock Tests",
    href: "/mock-tests",
    icon: ClipboardCheck,
  },
  {
    label: "Test Series",
    href: "/test-series",
    icon: Layers3,
  },
  {
    label: "Current Affairs",
    href: "/current-affairs",
    icon: Newspaper,
  },
  {
    label: "Previous Year Papers",
    href: "/previous-year-papers",
    icon: FileText,
  },
];

const companyLinks = [
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Blog",
    href: "/blog",
  },
];

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Refund / Cancellation",
    href: "/refund-cancellation",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#031F4F] text-white">

      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute -right-48 -top-48 h-[550px] w-[550px] rounded-full bg-[#0B63CE]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-[#F5A623]/10 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            TOP CTA
        =================================================== */}

        <div className="border-b border-white/10 py-10">

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#063B8F] to-[#0B63CE] p-6 shadow-2xl sm:p-8">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* CTA CONTENT */}

              <div className="flex items-start gap-4">

                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">

                  <GraduationCap className="h-7 w-7 text-[#F5A623]" />

                </div>

                <div>

                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">

                    <Sparkles className="h-3.5 w-3.5 text-[#F5A623]" />

                    Learn • Practice • Succeed

                  </div>

                  <h2 className="text-xl font-black sm:text-2xl">

                    Start your preparation with LearnPathshala

                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">

                    Explore courses, practice with mock tests, read current
                    affairs and solve previous year papers from one platform.

                  </p>

                </div>

              </div>

              {/* CTA BUTTON */}

              <Link
                href="/register"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-3.5 text-sm font-extrabold text-[#063B8F] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFB52E]"
              >

                Get Started

                <ArrowUpRight className="h-4 w-4" />

              </Link>

            </div>

          </div>

        </div>

        {/* ===================================================
            MAIN FOOTER
        =================================================== */}

        <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-10">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="lg:col-span-5">

            <Link
              href="/"
              className="inline-flex rounded-2xl bg-white px-4 py-2.5 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >

              <Image
                src="/learnpathshalalogo.png"
                alt="LearnPathshala"
                width={230}
                height={90}
                className="h-16 w-auto object-contain"
              />

            </Link>

            <p className="mt-6 max-w-xl text-sm leading-7 text-blue-100">

              LearnPathshala is a learning and exam preparation platform
              designed to bring courses, mock tests, test series, current
              affairs and previous year question papers together in one place.

            </p>

            {/* QUICK FEATURE CARDS */}

            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3">

              <Link
                href="/courses"
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >

                <BookOpen className="h-5 w-5 text-[#F5A623]" />

                <p className="mt-3 text-sm font-bold text-white">
                  Courses
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-200">
                  Build strong concepts
                </p>

              </Link>

              <Link
                href="/mock-tests"
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >

                <ClipboardCheck className="h-5 w-5 text-[#F5A623]" />

                <p className="mt-3 text-sm font-bold text-white">
                  Mock Tests
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-200">
                  Practice your preparation
                </p>

              </Link>

              <Link
                href="/current-affairs"
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >

                <Newspaper className="h-5 w-5 text-[#F5A623]" />

                <p className="mt-3 text-sm font-bold text-white">
                  Current Affairs
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-200">
                  Stay exam ready
                </p>

              </Link>

              <Link
                href="/previous-year-papers"
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >

                <FileText className="h-5 w-5 text-[#F5A623]" />

                <p className="mt-3 text-sm font-bold text-white">
                  Previous Papers
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-200">
                  Practice real questions
                </p>

              </Link>

            </div>

          </div>

          {/* =================================================
              PLATFORM LINKS
          ================================================= */}

          <div className="lg:col-span-2">

            <h3 className="relative inline-block text-sm font-extrabold uppercase tracking-wider text-white">

              Platform

              <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-[#F5A623]" />

            </h3>

            <ul className="mt-7 space-y-4">

              {platformLinks.map((link) => {

                const Icon = link.icon;

                return (
                  <li key={link.href}>

                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-blue-100 transition hover:text-[#F5A623]"
                    >

                      <Icon className="h-4 w-4 shrink-0 text-blue-300 transition group-hover:text-[#F5A623]" />

                      <span>
                        {link.label}
                      </span>

                      <ChevronRight
                        className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                      />

                    </Link>

                  </li>
                );
              })}

            </ul>

          </div>

          {/* =================================================
              COMPANY
          ================================================= */}

          <div className="lg:col-span-2">

            <h3 className="relative inline-block text-sm font-extrabold uppercase tracking-wider text-white">

              Company

              <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-[#F5A623]" />

            </h3>

            <ul className="mt-7 space-y-4">

              {companyLinks.map((link) => (

                <li key={link.href}>

                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-blue-100 transition hover:text-[#F5A623]"
                  >

                    <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623] opacity-50 transition group-hover:opacity-100" />

                    {link.label}

                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />

                  </Link>

                </li>

              ))}

            </ul>

            {/* TRUST */}

            <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">

              <ShieldCheck className="h-5 w-5 shrink-0 text-[#F5A623]" />

              <p className="text-xs leading-5 text-blue-200">
                LearnPathshala is built to provide a simple and organized
                learning experience.
              </p>

            </div>

          </div>

          {/* =================================================
              CONTACT
          ================================================= */}

          <div className="lg:col-span-3">

            <h3 className="relative inline-block text-sm font-extrabold uppercase tracking-wider text-white">

              Get In Touch

              <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-[#F5A623]" />

            </h3>

            <div className="mt-7 space-y-5">

              {/* EMAIL */}

              <a
                href="mailto:supportlearnpathshala@gmail.com"
                className="group flex items-start gap-3"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-[#F5A623]">

                  <Mail className="h-4 w-4 text-[#F5A623] group-hover:text-[#063B8F]" />

                </div>

                <div className="min-w-0">

                  <p className="text-xs font-medium text-blue-300">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-blue-50 transition group-hover:text-[#F5A623]">
                    supportlearnpathshala@gmail.com
                  </p>

                </div>

              </a>

              {/* PHONE */}

              <a
                href="tel:+918810524651"
                className="group flex items-start gap-3"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-[#F5A623]">

                  <Phone className="h-4 w-4 text-[#F5A623] group-hover:text-[#063B8F]" />

                </div>

                <div>

                  <p className="text-xs font-medium text-blue-300">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-blue-50 transition group-hover:text-[#F5A623]">
                    +91 8810524651 , 95821 39182
                  </p>

                </div>

              </a>

              {/* LOCATION */}

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">

                  <MapPin className="h-4 w-4 text-[#F5A623]" />

                </div>

                <div>

                  <p className="text-xs font-medium text-blue-300">
                    Location
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-50">
                    A-309, 2nd Floor
Landmark Vijay Vihar Petrol Pump & Mount Abu Junior School
Sector-4, Rohini
Delhi-85
                  </p>

                </div>

              </div>

            </div>

            {/* SOCIAL */}

            <div className="mt-7">

              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-300">
                Follow LearnPathshala
              </p>

              <div className="flex gap-2">

                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100 transition hover:-translate-y-1 hover:bg-white/10 hover:text-[#F5A623]"
                >
                  <Facebook size={17} />
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100 transition hover:-translate-y-1 hover:bg-white/10 hover:text-[#F5A623]"
                >
                  <Instagram size={17} />
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100 transition hover:-translate-y-1 hover:bg-white/10 hover:text-[#F5A623]"
                >
                  <Youtube size={17} />
                </a>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            GOLD DIVIDER
        =================================================== */}

        <div className="h-px bg-gradient-to-r from-transparent via-[#F5A623]/60 to-transparent" />

        {/* ===================================================
            LEGAL LINKS
        =================================================== */}

        <div className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">

          {/* COPYRIGHT */}

          <div>

            <p className="text-sm text-blue-200">

              © {new Date().getFullYear()}{" "}

              <span className="font-bold text-white">
                LearnPathshala
              </span>

              . All rights reserved.

            </p>

            <p className="mt-1 text-xs text-blue-300">
              Learn. Practice. Succeed.
            </p>

          </div>

          {/* LEGAL */}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

            {legalLinks.map((link) => (

              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-blue-200 transition hover:text-[#F5A623]"
              >
                {link.label}
              </Link>

            ))}

          </div>

        </div>

      </div>

    </footer>
  );
}