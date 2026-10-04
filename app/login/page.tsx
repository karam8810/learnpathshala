'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  BookOpen,
  Trophy,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /*
   * ============================================================
   * REDIRECT
   * ============================================================
   *
   * Example:
   *
   * /login?redirect=/mock-tests/123
   *
   * After login:
   *
   * /mock-tests/123
   */

  const redirectParam = searchParams.get('redirect');

  const getSafeRedirect = () => {
    if (!redirectParam) {
      return null;
    }

    /*
     * Security:
     * Only allow internal paths.
     *
     * Prevent:
     * /login?redirect=https://example.com
     */

    if (!redirectParam.startsWith('/')) {
      return null;
    }

    if (redirectParam.startsWith('//')) {
      return null;
    }

    return redirectParam;
  };

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        toast.error('Unable to sign in. Please try again.');
        setLoading(false);
        return;
      }

      /*
       * ========================================================
       * GET USER ROLE
       * ========================================================
       */

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          'Profile fetch error:',
          profileError,
        );
      }

      const role = profile?.role || 'student';

      toast.success('Welcome back!');

      /*
       * ========================================================
       * REDIRECT TO ORIGINAL PAGE
       * ========================================================
       */

      const safeRedirect = getSafeRedirect();

      if (safeRedirect) {
        router.push(safeRedirect);
      } else {
        router.push(`/dashboard/${role}`);
      }
    } catch (error) {
      console.error('Login error:', error);

      toast.error(
        'Something went wrong while signing in.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* =====================================================
            LEFT BRANDING
        ====================================================== */}

        <div className="relative hidden w-1/2 overflow-hidden bg-[#063B8F] p-12 lg:flex lg:flex-col lg:justify-between">
          {/* Background effects */}

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#0B63CE]/40 blur-3xl" />

            <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#F5A623]/20 blur-3xl" />

            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg">
              <img
                src="/learnpathshalalogo.png"
                alt="LearnPathshala"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="text-xl font-extrabold tracking-tight text-white">
                LearnPathshala
              </div>

              <div className="text-xs font-medium text-blue-100">
                Learn. Practice. Succeed.
              </div>
            </div>
          </Link>

          {/* =================================================
              MAIN CONTENT
          ================================================== */}

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
              Your learning journey starts here
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Welcome back to your
              <span className="block text-[#FFB52E]">
                learning journey.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-100">
              Sign in to access your courses, mock tests,
              dashboard and continue your preparation with
              LearnPathshala.
            </p>

            {/* Features */}

            <div className="mt-10 space-y-4">
              <BrandFeature
                icon={<BookOpen className="h-5 w-5" />}
                title="Learn at your pace"
                description="Access your courses and learning resources."
              />

              <BrandFeature
                icon={<Trophy className="h-5 w-5" />}
                title="Practice with mock tests"
                description="Improve your speed and exam preparation."
              />

              <BrandFeature
                icon={<Users className="h-5 w-5" />}
                title="Built for learners"
                description="A focused platform for competitive exam preparation."
              />
            </div>
          </div>

          {/* =================================================
              BOTTOM BRAND
          ================================================== */}

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-sm text-blue-100">
              © {new Date().getFullYear()} LearnPathshala
            </p>

            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
              Learn. Practice. Succeed.
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT LOGIN FORM
        ====================================================== */}

        <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">
            {/* =================================================
                MOBILE LOGO
            ================================================== */}

            <div className="mb-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-3 lg:hidden"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-slate-200">
                  <img
                    src="/learnpathshalalogo.png"
                    alt="LearnPathshala"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="text-left">
                  <div className="text-xl font-extrabold text-[#063B8F]">
                    LearnPathshala
                  </div>

                  <div className="text-xs font-medium text-slate-500">
                    Learn. Practice. Succeed.
                  </div>
                </div>
              </Link>

              {/* Desktop small logo */}

              <div className="mb-6 hidden justify-center lg:flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-slate-200">
                  <img
                    src="/learnpathshalalogo.png"
                    alt="LearnPathshala"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to your LearnPathshala account to
                continue learning.
              </p>
            </div>

            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* Email */}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-semibold text-slate-700"
                  >
                    Email Address
                  </Label>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      autoComplete="email"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 transition focus:border-[#0B63CE] focus:bg-white focus:ring-[#0B63CE]/20"
                    />
                  </div>
                </div>

                {/* Password */}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="font-semibold text-slate-700"
                    >
                      Password
                    </Label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#0B63CE] transition hover:text-[#063B8F]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      autoComplete="current-password"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 transition focus:border-[#0B63CE] focus:bg-white focus:ring-[#0B63CE]/20"
                    />
                  </div>
                </div>

                {/* Login Button */}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#063B8F] font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0B63CE]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* =================================================
                  REGISTER
              ================================================== */}

              <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={
                      redirectParam
                        ? `/register?redirect=${encodeURIComponent(
                            redirectParam,
                          )}`
                        : '/register'
                    }
                    className="font-bold text-[#0B63CE] transition hover:text-[#063B8F]"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>

            {/* =================================================
                TRUST TEXT
            ================================================== */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />

              Secure login powered by LearnPathshala
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * BRAND FEATURE
 * ============================================================
 */

function BrandFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#FFB52E] ring-1 ring-white/10">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <p className="mt-0.5 text-sm text-blue-100">
          {description}
        </p>
      </div>
    </div>
  );
}