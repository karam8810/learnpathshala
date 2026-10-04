"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Trophy,
  Users,
  PlayCircle,
  ClipboardCheck,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  FileText,
  Newspaper,
  Target,
  Clock3,
  Brain,
  Award,
  ShieldCheck,
  Layers3,
  Search,
  Star,
  Zap,
  BarChart3,
  Library,
} from "lucide-react";

import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">

      {/* =========================================================
          HEADER
      ========================================================= */}

  

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">

        {/* Decorative backgrounds */}

        <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-200/20 blur-3xl" />

        <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-blue-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* =====================================================
                HERO LEFT
            ===================================================== */}

            <div>

              {/* Badge */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-[#063B8F] shadow-sm">

                <Sparkles className="h-4 w-4 text-[#F5A623]" />

                Learn • Practice • Succeed

              </div>

              {/* Heading */}

              <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-[#062E6F] sm:text-5xl lg:text-6xl">

                Prepare Smarter.

                <span className="block bg-gradient-to-r from-[#063B8F] via-[#0B63CE] to-[#F5A623] bg-clip-text text-transparent">

                  Achieve Your Goals.

                </span>

              </h1>

              {/* Description */}

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">

                LearnPathshala brings courses, mock tests, current affairs,
                previous year papers and practice resources together in one
                simple learning platform.

              </p>
{/* {cta} */}
             <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">

  <Link
    href="/register"
    className="w-full sm:w-auto"
  >
    <Button
      size="lg"
      className="h-14 w-full rounded-xl bg-gradient-to-r from-[#063B8F] to-[#0B63CE] px-7 text-base font-bold text-white shadow-xl shadow-blue-900/20 transition hover:-translate-y-1 hover:from-[#052f73] hover:to-[#084fa8] sm:w-auto"
    >
      Start Learning

      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  </Link>

  <Link
    href="/mock-tests"
    className="w-full sm:w-auto"
  >
    <Button
      size="lg"
      variant="outline"
      className="!h-14 !w-full rounded-xl !border-2 !border-[#063B8F]/20 !bg-white px-7 !text-base !font-bold !text-[#063B8F] shadow-sm transition hover:-translate-y-1 hover:!border-[#F5A623] hover:!bg-amber-50 sm:!w-auto"
    >
      <ClipboardCheck className="mr-2 h-5 w-5" />

      Explore Mock Tests
    </Button>
  </Link>

</div>

              {/* Quick benefits */}

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">

                {[
                  "Structured preparation",
                  "Practice anytime",
                  "Track your progress",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                  >

                    <CheckCircle2 className="h-4 w-4 text-green-600" />

                    {item}

                  </div>

                ))}

              </div>

              {/* Stats */}

              <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur">

                <div className="px-3 text-center sm:px-5">

                  <div className="text-2xl font-black text-[#063B8F] sm:text-3xl">
                    500+
                  </div>

                  <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                    Courses
                  </div>

                </div>

                <div className="px-3 text-center sm:px-5">

                  <div className="text-2xl font-black text-[#063B8F] sm:text-3xl">
                    1000+
                  </div>

                  <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                    Practice Tests
                  </div>

                </div>

                <div className="px-3 text-center sm:px-5">

                  <div className="text-2xl font-black text-[#F5A623] sm:text-3xl">
                    24×7
                  </div>

                  <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                    Learn & Practice
                  </div>

                </div>

              </div>

            </div>

            {/* =====================================================
                HERO RIGHT
            ===================================================== */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-[#063B8F]/20 to-[#F5A623]/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-blue-900/15">

                {/* Logo */}

                <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 via-white to-amber-50 py-8">

                  <Image
                    src="/learnpathshalalogo.png"
                    alt="LearnPathshala Logo"
                    width={430}
                    height={300}
                    priority
                    className="h-auto max-h-[270px] w-auto object-contain"
                  />

                </div>

                {/* Learning cards */}

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <Link
                    href="/courses"
                    className="group rounded-xl bg-blue-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <BookOpen className="h-6 w-6 text-[#063B8F]" />

                    <p className="mt-3 text-sm font-bold text-[#063B8F]">
                      Courses
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Build strong concepts
                    </p>

                  </Link>

                  <Link
                    href="/mock-tests"
                    className="group rounded-xl bg-amber-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <Trophy className="h-6 w-6 text-[#F5A623]" />

                    <p className="mt-3 text-sm font-bold text-amber-700">
                      Mock Tests
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Practice under time
                    </p>

                  </Link>

                  <Link
                    href="/current-affairs"
                    className="group rounded-xl bg-purple-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <Newspaper className="h-6 w-6 text-purple-600" />

                    <p className="mt-3 text-sm font-bold text-purple-700">
                      Current Affairs
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Stay exam ready
                    </p>

                  </Link>

                  <Link
                    href="/previous-year-papers"
                    className="group rounded-xl bg-green-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <FileText className="h-6 w-6 text-green-600" />

                    <p className="mt-3 text-sm font-bold text-green-700">
                      Previous Papers
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Practice real papers
                    </p>

                  </Link>

                </div>

              </div>

              {/* Floating card */}

              <div className="absolute -right-5 -top-5 hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A623] to-[#FFB52E]">

                    <Zap className="h-5 w-5 text-white" />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#063B8F]">
                      Practice Daily
                    </p>

                    <p className="text-xs text-slate-500">
                      Improve step by step
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          QUICK ACCESS
      ========================================================= */}

      <section className="relative bg-white py-12">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: BookOpen,
                title: "Explore Courses",
                desc: "Learn concepts systematically",
                href: "/courses",
                bg: "bg-blue-50",
                iconBg: "bg-[#063B8F]",
              },
              {
                icon: ClipboardCheck,
                title: "Mock Tests",
                desc: "Test your preparation",
                href: "/mock-tests",
                bg: "bg-amber-50",
                iconBg: "bg-[#F5A623]",
              },
              {
                icon: Newspaper,
                title: "Current Affairs",
                desc: "Keep up with exam updates",
                href: "/current-affairs",
                bg: "bg-purple-50",
                iconBg: "bg-purple-600",
              },
              {
                icon: FileText,
                title: "Previous Papers",
                desc: "Practice previous questions",
                href: "/previous-year-papers",
                bg: "bg-green-50",
                iconBg: "bg-green-600",
              },
            ].map((item) => (

              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-slate-100 ${item.bg} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg} shadow-md`}
                  >

                    <item.icon className="h-6 w-6 text-white" />

                  </div>

                  <div className="min-w-0">

                    <h3 className="font-bold text-[#063B8F]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.desc}
                    </p>

                  </div>

                  <ChevronRight className="ml-auto h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#063B8F]" />

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}

      <section className="bg-slate-50 py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Everything In One Place
            </div>

            <h2 className="text-3xl font-black text-[#063B8F] sm:text-4xl">
              Your Complete Preparation Platform
            </h2>

            <p className="mt-4 text-lg leading-7 text-slate-600">
              From learning concepts to testing your preparation,
              LearnPathshala gives you the tools to build a consistent
              preparation routine.
            </p>

          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: BookOpen,
                title: "Structured Courses",
                desc: "Follow organized learning resources and strengthen your fundamentals.",
                bg: "bg-blue-50",
                iconBg: "bg-[#063B8F]",
                href: "/courses",
              },
              {
                icon: ClipboardCheck,
                title: "Mock Tests",
                desc: "Practice with objective tests and review your performance after every attempt.",
                bg: "bg-amber-50",
                iconBg: "bg-[#F5A623]",
                href: "/mock-tests",
              },
              {
                icon: Newspaper,
                title: "Current Affairs",
                desc: "Read important updates and test your knowledge with current affairs quizzes.",
                bg: "bg-purple-50",
                iconBg: "bg-purple-600",
                href: "/current-affairs",
              },
              {
                icon: FileText,
                title: "Previous Year Papers",
                desc: "Understand question patterns by practicing previous year question papers.",
                bg: "bg-green-50",
                iconBg: "bg-green-600",
                href: "/previous-year-papers",
              },
            ].map((feature) => (

              <div
                key={feature.title}
                className={`group rounded-2xl border border-slate-100 ${feature.bg} p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
              >

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg} shadow-lg`}
                >

                  <feature.icon className="h-7 w-7 text-white" />

                </div>

                <h3 className="mt-6 text-xl font-bold text-[#063B8F]">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.desc}
                </p>

                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center text-sm font-bold text-[#063B8F]"
                >

                  Explore

                  <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />

                </Link>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================
          EXAM PREPARATION
      ========================================================= */}

      <section className="bg-white py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* LEFT */}

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#063B8F]">

                <Target className="h-4 w-4" />

                Prepare With A Plan

              </div>

              <h2 className="text-3xl font-black leading-tight text-[#063B8F] sm:text-4xl">

                Turn Your Preparation Into A Daily Routine

              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">

                Consistent preparation becomes easier when learning,
                practice and revision are connected. Build your routine
                around these simple steps.

              </p>

              <div className="mt-8 space-y-5">

                {[
                  {
                    number: "01",
                    icon: Brain,
                    title: "Learn",
                    desc: "Build concepts through structured courses and learning resources.",
                  },
                  {
                    number: "02",
                    icon: ClipboardCheck,
                    title: "Practice",
                    desc: "Attempt mock tests and quizzes to test your understanding.",
                  },
                  {
                    number: "03",
                    icon: BarChart3,
                    title: "Analyze",
                    desc: "Review your performance and identify areas that need more practice.",
                  },
                  {
                    number: "04",
                    icon: Trophy,
                    title: "Improve",
                    desc: "Repeat, revise and gradually strengthen your preparation.",
                  },
                ].map((step) => (

                  <div
                    key={step.number}
                    className="flex gap-4"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#063B8F] text-sm font-black text-white">
                      {step.number}
                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <step.icon className="h-5 w-5 text-[#F5A623]" />

                        <h3 className="font-bold text-[#063B8F]">
                          {step.title}
                        </h3>

                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {step.desc}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* RIGHT */}

            <div className="relative">

              <div className="absolute inset-0 rounded-[2rem] bg-blue-100/50 blur-3xl" />

              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">

                {/* Dashboard preview */}

                <div className="rounded-2xl bg-gradient-to-br from-[#063B8F] to-[#0B63CE] p-6 text-white">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-blue-100">
                        Your Preparation
                      </p>

                      <h3 className="mt-1 text-2xl font-black">
                        Keep Going
                      </h3>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">

                      <GraduationCap className="h-6 w-6" />

                    </div>

                  </div>

                  <div className="mt-7">

                    <div className="flex justify-between text-sm">

                      <span className="text-blue-100">
                        Weekly Practice
                      </span>

                      <span className="font-bold">
                        Active
                      </span>

                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">

                      <div className="h-full w-[72%] rounded-full bg-[#F5A623]" />

                    </div>

                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-blue-50 p-5">

                    <Clock3 className="h-6 w-6 text-[#063B8F]" />

                    <p className="mt-3 text-sm font-bold text-[#063B8F]">
                      Practice Regularly
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Make preparation part of your routine.
                    </p>

                  </div>

                  <div className="rounded-2xl bg-amber-50 p-5">

                    <Award className="h-6 w-6 text-[#F5A623]" />

                    <p className="mt-3 text-sm font-bold text-amber-700">
                      Review Results
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Learn from every practice session.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          RESOURCES
      ========================================================= */}

      <section className="bg-slate-50 py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
                Study Resources
              </div>

              <h2 className="text-3xl font-black text-[#063B8F] sm:text-4xl">
                Resources For Your Preparation
              </h2>

              <p className="mt-3 max-w-2xl text-slate-600">
                Quickly access the resources that can help you learn,
                revise and practice.
              </p>

            </div>

            <Link
              href="/courses"
              className="inline-flex items-center text-sm font-bold text-[#063B8F]"
            >

              Explore All

              <ArrowRight className="ml-2 h-4 w-4" />

            </Link>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Courses */}

            <Link
              href="/courses"
              className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/60 blur-2xl" />

              <div className="relative">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#063B8F] shadow-lg">

                  <BookOpen className="h-7 w-7 text-white" />

                </div>

                <h3 className="mt-6 text-2xl font-black text-[#063B8F]">
                  Courses
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Explore structured learning resources designed to help
                  you understand important concepts step by step.
                </p>

                <div className="mt-6 inline-flex items-center font-bold text-[#063B8F]">

                  Browse Courses

                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />

                </div>

              </div>

            </Link>

            {/* Current Affairs */}

            <Link
              href="/current-affairs"
              className="group relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-100/60 blur-2xl" />

              <div className="relative">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 shadow-lg">

                  <Newspaper className="h-7 w-7 text-white" />

                </div>

                <h3 className="mt-6 text-2xl font-black text-[#063B8F]">
                  Current Affairs
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Read important current affairs and use quizzes to
                  check how well you remember them.
                </p>

                <div className="mt-6 inline-flex items-center font-bold text-[#063B8F]">

                  Read Current Affairs

                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />

                </div>

              </div>

            </Link>

            {/* Previous Papers */}

            <Link
              href="/previous-year-papers"
              className="group relative overflow-hidden rounded-3xl border border-green-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-green-100/60 blur-2xl" />

              <div className="relative">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 shadow-lg">

                  <Library className="h-7 w-7 text-white" />

                </div>

                <h3 className="mt-6 text-2xl font-black text-[#063B8F]">
                  Previous Year Papers
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Practice previous year question papers and become
                  familiar with the type of questions asked.
                </p>

                <div className="mt-6 inline-flex items-center font-bold text-[#063B8F]">

                  View Papers

                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />

                </div>

              </div>

            </Link>

          </div>

        </div>

      </section>

      {/* =========================================================
          WHY LEARNPATHSHALA
      ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#063B8F] to-[#0B63CE] py-20 text-white lg:py-24">

        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* LEFT */}

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-amber-300">

                <Sparkles className="h-4 w-4" />

                Why LearnPathshala?

              </div>

              <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">

                One Platform.

                <span className="block text-amber-300">
                  Multiple Ways To Learn.
                </span>

              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">

                Learning is not only about reading. LearnPathshala combines
                learning resources, practice, revision and performance
                tracking so you can build a more consistent preparation
                routine.

              </p>

              <div className="mt-8 space-y-4">

                {[
                  {
                    icon: ShieldCheck,
                    text: "Organized learning experience",
                  },
                  {
                    icon: ClipboardCheck,
                    text: "Mock tests and practice quizzes",
                  },
                  {
                    icon: FileText,
                    text: "Previous year question papers",
                  },
                  {
                    icon: Newspaper,
                    text: "Current affairs and exam updates",
                  },
                  {
                    icon: BarChart3,
                    text: "Performance-focused preparation",
                  },
                ].map((item) => (

                  <div
                    key={item.text}
                    className="flex items-center gap-3"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">

                      <item.icon className="h-4 w-4 text-amber-300" />

                    </div>

                    <span className="font-medium text-white">
                      {item.text}
                    </span>

                  </div>

                ))}

              </div>

              <Link href="/register">

                <Button
                  size="lg"
                  className="mt-9 bg-gradient-to-r from-[#F5A623] to-[#FFB52E] font-bold text-[#063B8F] shadow-xl hover:from-[#e99a14] hover:to-[#f2a820]"
                >

                  Join LearnPathshala

                  <ArrowRight className="ml-2 h-5 w-5" />

                </Button>

              </Link>

            </div>

            {/* RIGHT */}

            <div className="relative">

              <div className="absolute inset-0 rounded-[2rem] bg-amber-300/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">

                <div className="rounded-2xl bg-white p-6">

                  {/* Brand */}

                  <div className="flex items-center gap-4 border-b border-slate-100 pb-5">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">

                      <GraduationCap className="h-7 w-7 text-[#063B8F]" />

                    </div>

                    <div>

                      <p className="font-bold text-[#063B8F]">
                        LearnPathshala
                      </p>

                      <p className="text-sm text-slate-500">
                        Learn. Practice. Succeed.
                      </p>

                    </div>

                  </div>

                  {/* Stats */}

                  <div className="mt-5 grid grid-cols-2 gap-4">

                    <div className="rounded-xl bg-blue-50 p-5">

                      <BookOpen className="h-6 w-6 text-[#063B8F]" />

                      <p className="mt-3 text-2xl font-black text-[#063B8F]">
                        500+
                      </p>

                      <p className="text-sm text-slate-500">
                        Courses
                      </p>

                    </div>

                    <div className="rounded-xl bg-amber-50 p-5">

                      <Trophy className="h-6 w-6 text-[#F5A623]" />

                      <p className="mt-3 text-2xl font-black text-[#063B8F]">
                        1K+
                      </p>

                      <p className="text-sm text-slate-500">
                        Practice Tests
                      </p>

                    </div>

                    <div className="rounded-xl bg-purple-50 p-5">

                      <Newspaper className="h-6 w-6 text-purple-600" />

                      <p className="mt-3 text-2xl font-black text-[#063B8F]">
                        Daily
                      </p>

                      <p className="text-sm text-slate-500">
                        Current Affairs
                      </p>

                    </div>

                    <div className="rounded-xl bg-green-50 p-5">

                      <FileText className="h-6 w-6 text-green-600" />

                      <p className="mt-3 text-2xl font-black text-[#063B8F]">
                        PYQ
                      </p>

                      <p className="text-sm text-slate-500">
                        Practice Papers
                      </p>

                    </div>

                  </div>

                  {/* Message */}

                  <div className="mt-4 rounded-xl bg-gradient-to-r from-[#063B8F] to-[#0B63CE] p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-blue-100">
                          Your preparation
                        </p>

                        <p className="mt-1 text-lg font-bold text-white">
                          Keep learning. Keep practicing.
                        </p>

                      </div>

                      <Sparkles className="h-8 w-8 text-amber-300" />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          BENEFITS
      ========================================================= */}

      <section className="bg-white py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Built For Learners
            </div>

            <h2 className="text-3xl font-black text-[#063B8F] sm:text-4xl">
              Make Every Study Session Count
            </h2>

            <p className="mt-4 text-lg text-slate-600">
              Use the platform to create a simple cycle of learning,
              practice and improvement.
            </p>

          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {[
              {
                icon: Brain,
                title: "Understand Concepts",
                desc: "Learn through organized resources before moving into intensive practice.",
              },
              {
                icon: Clock3,
                title: "Practice Efficiently",
                desc: "Use timed mock tests and quizzes to make your practice sessions focused.",
              },
              {
                icon: BarChart3,
                title: "Review Performance",
                desc: "Use your results to understand where you need more revision and practice.",
              },
              {
                icon: FileText,
                title: "Practice Previous Papers",
                desc: "Work through previous year papers to understand question patterns.",
              },
              {
                icon: Newspaper,
                title: "Stay Updated",
                desc: "Follow current affairs and important exam-related updates.",
              },
              {
                icon: Target,
                title: "Prepare With Purpose",
                desc: "Build a consistent preparation routine around your target examination.",
              },
            ].map((benefit) => (

              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <benefit.icon className="h-6 w-6 text-[#063B8F]" />

                </div>

                <h3 className="mt-5 text-lg font-bold text-[#063B8F]">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {benefit.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20">

        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">

          <Image
            src="/learnpathshalalogo.png"
            alt="LearnPathshala"
            width={300}
            height={180}
            className="mx-auto h-28 w-auto object-contain sm:h-32"
          />

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">

            <Star className="h-4 w-4 fill-current" />

            Learn • Practice • Succeed

          </div>

          <h2 className="mt-5 text-3xl font-black text-[#063B8F] sm:text-5xl">

            Ready To Start Your Preparation?

          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">

            Explore courses, attempt mock tests, read current affairs and
            practice previous year papers — all from one platform.

          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <Link href="/register">

              <Button
                size="lg"
                className="h-14 w-full rounded-xl bg-gradient-to-r from-[#063B8F] to-[#0B63CE] px-8 text-base font-bold text-white shadow-xl shadow-blue-900/20 hover:from-[#052f73] hover:to-[#084fa8] sm:w-auto"
              >

                Get Started Today

                <ArrowRight className="ml-2 h-5 w-5" />

              </Button>

            </Link>

            <Link href="/mock-tests">

              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-xl border-2 border-[#063B8F]/20 bg-white px-8 text-base font-bold text-[#063B8F] hover:border-[#F5A623] hover:bg-amber-50 sm:w-auto"
              >

                <ClipboardCheck className="mr-2 h-5 w-5" />

                Try Mock Tests

              </Button>

            </Link>

          </div>

        </div>

      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      
    </div>
  );
}