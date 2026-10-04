'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageCircle,
  Clock,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Headphones,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [sending, setSending] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      toast.error('Please fill in all fields.');
      return;
    }

    setSending(true);

    try {
      /*
       * Current behavior:
       * This simulates a successful submission.
       *
       * Later you can replace this with:
       * - Supabase
       * - Resend
       * - Email API
       * - Your own API route
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      toast.success(
        'Thank you for reaching out! We will get back to you soon.'
      );

      setForm({
        name: '',
        email: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form error:', error);

      toast.error(
        'Something went wrong. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">

        {/* Background decoration */}

        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#063B8F] shadow-sm">

              <Sparkles className="h-4 w-4 text-[#F5A623]" />

              We're here to help

            </div>

            {/* Heading */}

            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B8F] sm:text-5xl lg:text-6xl">

              Get in Touch

            </h1>

            {/* Description */}

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">

              Have a question about our courses, mock tests or
              learning platform? Send us a message and our team
              will be happy to help.

            </p>

            {/* Quick links */}

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

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
                  <MessageCircle className="mr-2 h-5 w-5 text-[#063B8F]" />
                  Explore Mock Tests
                </Button>

              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT SECTION
      ===================================================== */}

      <section className="bg-white py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-5">

            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div className="lg:col-span-2">

              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
                Contact LearnPathshala
              </div>

              <h2 className="text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
                We're here to help
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Whether you have a question about a course, need
                help with your account, have a suggestion or want
                to learn more about LearnPathshala, feel free to
                contact us.
              </p>

              {/* Contact Cards */}

              <div className="mt-8 space-y-5">

                {/* Email */}

                <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                    <Mail className="h-6 w-6 text-[#063B8F]" />

                  </div>

                  <div>

                    <h3 className="font-bold text-[#063B8F]">
                      Email
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      supportlearnpathshala@gmail.com
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Send us your questions anytime
                    </p>

                  </div>

                </div>

                {/* Phone */}

                <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-100 hover:shadow-lg">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">

                    <Phone className="h-6 w-6 text-emerald-600" />

                  </div>

                  <div>

                    <h3 className="font-bold text-[#063B8F]">
                      Phone
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      +91 8810524651
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">

                      <Clock className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-400">
                        Mon to Sat, 9 AM - 6 PM IST
                      </p>

                    </div>

                  </div>

                </div>

                {/* Address */}

                <div className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-100 hover:shadow-lg">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">

                    <MapPin className="h-6 w-6 text-amber-600" />

                  </div>

                  <div>

                    <h3 className="font-bold text-[#063B8F]">
                      Address
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      ShaanAcademy, New Delhi, India 110001
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                CONTACT FORM
            ================================================= */}

            <div className="lg:col-span-3">

              <Card
                className="
                  overflow-hidden
                  rounded-3xl
                  border-blue-100
                  bg-white
                  shadow-xl
                  shadow-blue-900/10
                "
              >

                {/* Form Header */}

                <div className="bg-gradient-to-r from-[#063B8F] to-[#0B63CE] px-6 py-7 text-white sm:px-8">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">

                      <Headphones className="h-6 w-6 text-amber-300" />

                    </div>

                    <div>

                      <h2 className="text-xl font-bold">
                        Send us a message
                      </h2>

                      <p className="mt-1 text-sm text-blue-100">
                        We'll get back to you as soon as possible.
                      </p>

                    </div>

                  </div>

                </div>

                <CardContent className="p-6 sm:p-8">

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >

                    {/* Name */}

                    <div className="space-y-2">

                      <Label
                        htmlFor="name"
                        className="font-semibold text-slate-700"
                      >
                        Name
                      </Label>

                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter your name"
                        disabled={sending}
                        className="
                          h-12
                          rounded-xl
                          border-slate-200
                          focus:border-[#063B8F]
                          focus:ring-[#063B8F]/20
                        "
                      />

                    </div>

                    {/* Email */}

                    <div className="space-y-2">

                      <Label
                        htmlFor="email"
                        className="font-semibold text-slate-700"
                      >
                        Email
                      </Label>

                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email: e.target.value,
                          })
                        }
                        placeholder="you@example.com"
                        disabled={sending}
                        className="
                          h-12
                          rounded-xl
                          border-slate-200
                          focus:border-[#063B8F]
                          focus:ring-[#063B8F]/20
                        "
                      />

                    </div>

                    {/* Message */}

                    <div className="space-y-2">

                      <Label
                        htmlFor="message"
                        className="font-semibold text-slate-700"
                      >
                        Message
                      </Label>

                      <Textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            message: e.target.value,
                          })
                        }
                        placeholder="How can we help you?"
                        rows={6}
                        disabled={sending}
                        className="
                          resize-none
                          rounded-xl
                          border-slate-200
                          focus:border-[#063B8F]
                          focus:ring-[#063B8F]/20
                        "
                      />

                    </div>

                    {/* Submit */}

                    <Button
                      type="submit"
                      disabled={sending}
                      className="
                        h-13
                        w-full
                        rounded-xl
                        bg-gradient-to-r
                        from-[#063B8F]
                        to-[#0B63CE]
                        font-bold
                        text-white
                        shadow-lg
                        shadow-blue-900/20
                        transition-all
                        hover:-translate-y-0.5
                        hover:from-[#052f73]
                        hover:to-[#084fa8]
                      "
                    >

                      {sending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}

                    </Button>

                    <p className="text-center text-xs leading-5 text-slate-400">
                      Please provide accurate contact information so
                      our team can respond to your query.
                    </p>

                  </form>

                </CardContent>

              </Card>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY CONTACT US
      ===================================================== */}

      <section className="bg-slate-50 py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#F5A623]">
              Support
            </div>

            <h2 className="text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
              How can we help?
            </h2>

            <p className="mt-4 text-lg text-slate-600">
              Reach out to us for questions related to your
              LearnPathshala learning experience.
            </p>

          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {/* Courses */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                <GraduationCap className="h-7 w-7 text-[#063B8F]" />

              </div>

              <h3 className="mt-6 text-lg font-bold text-[#063B8F]">
                Course Questions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Need information about a course, enrollment or
                learning content? Send us your question.
              </p>

            </div>

            {/* Account */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">

                <CheckCircle2 className="h-7 w-7 text-emerald-600" />

              </div>

              <h3 className="mt-6 text-lg font-bold text-[#063B8F]">
                Account Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact us if you need help with your account,
                enrollment or access to learning resources.
              </p>

            </div>

            {/* Suggestions */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">

                <MessageCircle className="h-7 w-7 text-amber-600" />

              </div>

              <h3 className="mt-6 text-lg font-bold text-[#063B8F]">
                Feedback & Suggestions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Have an idea that could improve LearnPathshala?
                We'd love to hear your suggestions.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-gradient-to-br from-blue-50 via-white to-amber-50 py-20">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">

            <GraduationCap className="h-8 w-8 text-[#063B8F]" />

          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-[#063B8F] sm:text-4xl">
            Continue your learning journey
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Explore LearnPathshala courses and mock tests and
            take the next step toward your learning goals.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

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
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

            </Link>

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
                Explore Mock Tests
              </Button>

            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}