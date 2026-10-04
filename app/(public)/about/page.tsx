import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Video,
  Target,
  Heart,
  CheckCircle2,
  GraduationCap,
  ClipboardCheck,
  Sparkles,
  Brain,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

/* ============================================================
   SEO METADATA
============================================================ */

export const metadata: Metadata = {
  title:
    'About LearnPathshala | Online Learning & Exam Preparation Platform',

  description:
    'Learn about LearnPathshala, founded by Shantanu Bhora, and discover our mission to provide structured courses, mock tests, quizzes and accessible online learning for students and competitive exam aspirants.',

  keywords: [
    'LearnPathshala',
    'About LearnPathshala',
    'Shantanu Bhora',
    'LearnPathshala founder',
    'online learning platform',
    'online education platform',
    'competitive exam preparation',
    'competitive exam courses',
    'mock tests',
    'online courses',
    'student learning platform',
    'exam preparation platform',
    'learning courses',
    'live classes',
    'online quizzes',
    'education platform India',
  ],

  openGraph: {
    title:
      'About LearnPathshala | Learn. Practice. Succeed.',

    description:
      'Discover LearnPathshala, founded by Shantanu Bhora, and our mission to make structured and accessible online learning available to students and exam aspirants.',

    type: 'website',

    siteName: 'LearnPathshala',
  },

  twitter: {
    card: 'summary_large_image',

    title:
      'About LearnPathshala | Online Learning Platform',

    description:
      'Learn about LearnPathshala, its mission, learning platform and founder Shantanu Bhora.',
  },

  robots: {
    index: true,
    follow: true,
  },
};

/* ============================================================
   VALUES
============================================================ */

const values = [
  {
    icon: Target,
    title: 'Quality Learning',
    description:
      'We focus on structured courses, useful practice resources and learning experiences designed around student needs.',
  },

  {
    icon: Heart,
    title: 'Student-Centric',
    description:
      'Our platform is designed to make learning simple, accessible and focused on helping students make consistent progress.',
  },

  {
    icon: Users,
    title: 'Empowering Educators',
    description:
      'We provide teachers and educators with tools to share their knowledge and create meaningful learning experiences.',
  },

  {
    icon: Award,
    title: 'Continuous Improvement',
    description:
      'We continuously improve our platform, content and learning tools based on the needs of students and educators.',
  },
];

/* ============================================================
   LEARNING FEATURES
============================================================ */

const learningFeatures = [
  {
    icon: BookOpen,
    title: 'Structured Courses',
    description:
      'Learn through organized courses designed to help you build concepts step by step.',
  },

  {
    icon: ClipboardCheck,
    title: 'Mock Tests',
    description:
      'Practice with mock tests and understand your performance through test results.',
  },

  {
    icon: Brain,
    title: 'Interactive Practice',
    description:
      'Strengthen your preparation with quizzes and regular practice.',
  },

  {
    icon: Video,
    title: 'Live Learning',
    description:
      'Connect with educators through live learning experiences and classes.',
  },
];

/* ============================================================
   ABOUT PAGE
============================================================ */

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">

        {/* Background decoration */}

        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#063B8F] shadow-sm">

              <Sparkles className="h-4 w-4 text-[#F5A623]" />

              Learn • Practice • Succeed

            </div>

            {/* Heading */}

            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B8F] sm:text-5xl lg:text-6xl">

              About LearnPathshala

            </h1>

            {/* Description */}

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">

              LearnPathshala is an online learning platform built to make
              education, practice and exam preparation more structured,
              accessible and engaging for students.

            </p>

            {/* Buttons */}

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

              {/* Courses */}

              <Link href="/courses">

                <Button
                  size="lg"
                  className="
                    h-14
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-[#063B8F]
                    to-[#0B63CE]
                    px-7
                    font-bold
                    text-white
                    shadow-xl
                    shadow-blue-900/20
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:from-[#052f73]
                    hover:to-[#084fa8]
                    sm:w-auto
                  "
                >

                  Explore Courses

                  <ArrowRight className="ml-2 h-5 w-5" />

                </Button>

              </Link>

              {/* Mock Tests */}

              <Link href="/mock-tests">

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
                    px-7
                    font-bold
                    text-[#063B8F]
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-[#F5A623]
                    hover:bg-amber-50
                    hover:text-[#063B8F]
                    focus:text-[#063B8F]
                    sm:w-auto
                  "
                >

                  <ClipboardCheck
                    className="mr-2 h-5 w-5 text-[#063B8F]"
                  />

                  Explore Mock Tests

                </Button>

              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          OUR STORY
      ====================================================== */}

      <section className="bg-white py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Text */}

            <div>

              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
                Our Story
              </div>

              <h2 className="text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
                Building a better way to learn
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                LearnPathshala was created with a simple idea:
                learning should be accessible, structured and focused
                on real student needs.
              </p>

              <p className="mt-5 leading-8 text-slate-600">
                Traditional learning and modern technology can work
                together. LearnPathshala brings courses, practice,
                mock tests, quizzes and learning resources together
                in one platform so students can learn and practice
                in a more organized way.
              </p>

              <p className="mt-5 leading-8 text-slate-600">
                Whether a student is building fundamental knowledge,
                preparing for competitive examinations or improving
                through regular practice, our goal is to provide
                useful tools that support their learning journey.
              </p>

            </div>

            {/* Visual */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-[#063B8F]/10 to-[#F5A623]/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-8 shadow-xl">

                <div className="flex justify-center">

                  <Image
                    src="/learnpathshalalogo.png"
                    alt="LearnPathshala online learning platform"
                    width={420}
                    height={260}
                    priority
                    className="h-auto max-h-60 w-auto object-contain"
                  />

                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <BookOpen className="h-7 w-7 text-[#063B8F]" />

                    <p className="mt-3 font-bold text-[#063B8F]">
                      Courses
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Structured learning
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <Trophy className="h-7 w-7 text-[#F5A623]" />

                    <p className="mt-3 font-bold text-[#063B8F]">
                      Practice
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Tests & quizzes
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          FOUNDER
      ====================================================== */}

      <section className="overflow-hidden bg-gradient-to-br from-[#063B8F] to-[#0B63CE] py-20 text-white">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Founder Visual */}

            <div className="flex justify-center lg:justify-start">

              <div className="relative">

                <div className="absolute -inset-6 rounded-full bg-amber-300/20 blur-3xl" />

                <div
                  className="
                    relative
                    flex
                    h-72
                    w-72
                    items-center
                    justify-center
                    rounded-full
                    border-8
                    border-white/10
                    bg-white/10
                    shadow-2xl
                    backdrop-blur
                  "
                >

                  <div
                    className="
                      flex
                      h-56
                      w-56
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      shadow-xl
                    "
                  >

                    <GraduationCap
                      className="h-28 w-28 text-[#063B8F]"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Founder Content */}

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-amber-300">

                <Sparkles className="h-4 w-4" />

                Founder & Vision

              </div>

              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Meet the Founder
              </h2>

              <h3 className="mt-4 text-3xl font-extrabold text-amber-300">
                Shantanu Bhora
              </h3>

              <p className="mt-5 text-lg leading-8 text-blue-100">

                LearnPathshala was founded by Shantanu Bhora with
                a vision to create a modern and accessible learning
                platform where students can learn, practice and
                prepare in a more structured way.

              </p>

              <p className="mt-5 leading-8 text-blue-100">

                His vision is to bring education and technology
                together to create a student-focused learning
                experience that provides structured courses,
                mock tests, quizzes and learning resources in
                one platform.

              </p>

              <p className="mt-5 leading-8 text-blue-100">

                LearnPathshala aims to support students throughout
                their learning journey by making quality educational
                resources easier to access and practice.

              </p>

              {/* Founder Values */}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">

                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-300" />

                  <span className="text-sm font-medium text-white">
                    Student First
                  </span>

                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">

                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-300" />

                  <span className="text-sm font-medium text-white">
                    Innovation
                  </span>

                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">

                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-300" />

                  <span className="text-sm font-medium text-white">
                    Accessible Education
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          MISSION
      ====================================================== */}

      <section className="bg-gradient-to-b from-white to-blue-50 py-20">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">

            <Target className="h-8 w-8 text-[#063B8F]" />

          </div>

          <div className="mt-6 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
            Our Mission
          </div>

          <h2 className="mt-3 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
            Making learning more accessible and effective
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">

            Our mission is to create a learning environment where
            students have access to quality educational content,
            structured courses, practice tests and tools that help
            them learn consistently and prepare with confidence.

          </p>

        </div>

      </section>

      {/* ======================================================
          WHAT WE OFFER
      ====================================================== */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Learning Experience
            </div>

            <h2 className="text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
              Everything students need to keep learning
            </h2>

            <p className="mt-4 text-lg text-slate-600">

              LearnPathshala brings essential learning and practice
              tools together in one platform.

            </p>

          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {learningFeatures.map((feature) => (
              <div
                key={feature.title}
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:border-blue-100
                  hover:shadow-xl
                "
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                  <feature.icon
                    className="h-7 w-7 text-[#063B8F]"
                  />

                </div>

                <h3 className="mt-6 text-lg font-bold text-[#063B8F]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ======================================================
          VALUES
      ====================================================== */}

      <section className="bg-slate-50 py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Our Values
            </div>

            <h2 className="text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
              What we stand for
            </h2>

            <p className="mt-4 text-lg text-slate-600">

              The principles that guide how we build LearnPathshala.

            </p>

          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {values.map((value) => (
              <div
                key={value.title}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-7
                  shadow-sm
                  transition
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#063B8F] to-[#0B63CE] shadow-lg shadow-blue-900/15">

                  <value.icon className="h-7 w-7 text-white" />

                </div>

                <h3 className="mt-6 text-lg font-bold text-[#063B8F]">
                  {value.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {value.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ======================================================
          STATS
      ====================================================== */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-6 sm:grid-cols-3">

            {[
              {
                icon: Users,
                value: '10,000+',
                label: 'Active Students',
              },

              {
                icon: BookOpen,
                value: '500+',
                label: 'Published Courses',
              },

              {
                icon: Video,
                value: '2,000+',
                label: 'Live Classes Held',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  p-8
                  text-center
                  shadow-sm
                "
              >

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                  <stat.icon
                    className="h-7 w-7 text-[#063B8F]"
                  />

                </div>

                <div className="mt-5 text-3xl font-extrabold text-[#063B8F]">
                  {stat.value}
                </div>

                <div className="mt-1 text-sm font-medium text-slate-500">
                  {stat.label}
                </div>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-20">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

            <GraduationCap className="h-8 w-8 text-[#063B8F]" />

          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">

            Ready to start your learning journey?

          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">

            Explore LearnPathshala courses, practice with mock tests
            and take the next step toward your learning goals.

          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            {/* Get Started */}

            <Link href="/register">

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
                  duration-200
                  hover:-translate-y-0.5
                  hover:from-[#052f73]
                  hover:to-[#084fa8]
                  sm:w-auto
                "
              >

                Get Started

                <ArrowRight className="ml-2 h-5 w-5" />

              </Button>

            </Link>

            {/* Browse Courses */}

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
                  duration-200
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