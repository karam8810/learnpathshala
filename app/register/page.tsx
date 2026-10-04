'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
  Shield,
  BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

type Role = 'student' | 'teacher' | 'admin';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phoneNumber,
          address,
          role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success(
        'Account created! Welcome to LearnPathshala.'
      );
      router.push(`/dashboard/${role}`);
    }

    setLoading(false);
  };

  const roles: {
    value: Role;
    label: string;
    icon: typeof Shield;
    desc: string;
    color: string;
  }[] = [
    {
      value: 'student',
      label: 'Student',
      icon: GraduationCap,
      desc: 'Learn and grow',
      color: 'from-[#F5A623] to-[#FFB52E]',
    },
    {
      value: 'teacher',
      label: 'Teacher',
      icon: BookOpen,
      desc: 'Teach and inspire',
      color: 'from-[#0B63CE] to-[#063B8F]',
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      desc: 'Manage everything',
      color: 'from-slate-700 to-slate-900',
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* =====================================================
          LEFT SIDE - FORM
      ====================================================== */}

      <div className="flex w-full items-center justify-center bg-slate-50 px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">

          {/* =================================================
              LOGO
          ================================================== */}

          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-md ring-1 ring-slate-200">
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

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Join LearnPathshala and start your learning journey
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* =================================================
                ROLE
            ================================================== */}

            <div className="space-y-2">
              <Label>
                I want to join as a
              </Label>

              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                      role === r.value
                        ? 'border-[#063B8F] bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-[#0B63CE]/40'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${r.color} shadow-md`}
                    >
                      <r.icon className="h-5 w-5 text-white" />
                    </div>

                    <span className="text-sm font-semibold text-slate-900">
                      {r.label}
                    </span>

                    <span className="text-xs text-slate-500">
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                FULL NAME
            ================================================== */}

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* =================================================
                EMAIL
            ================================================== */}

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* =================================================
                PHONE
            ================================================== */}

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number
              </Label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 8810524651"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value)
                  }
                  required
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* =================================================
                ADDRESS
            ================================================== */}

            <div className="space-y-2">
              <Label htmlFor="address">
                Address
              </Label>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="address"
                  type="text"
                  placeholder="Your city and full address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  required
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* =================================================
                CREATE ACCOUNT
            ================================================== */}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-[#063B8F] text-white shadow-lg shadow-blue-900/20 hover:bg-[#0B63CE]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* =================================================
              LOGIN
          ================================================== */}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}

            <Link
              href="/login"
              className="font-semibold text-[#0B63CE] hover:text-[#063B8F]"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE - BRANDING
      ====================================================== */}

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#063B8F] p-12 lg:flex">

        {/* Background */}

        <div className="absolute inset-0">
          <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[#0B63CE]/40 blur-3xl" />

          <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-[#F5A623]/20 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* =================================================
            TOP LOGO
        ================================================== */}

        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg">
              <img
                src="/learnpathshalalogo.png"
                alt="LearnPathshala"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="text-xl font-extrabold text-white">
                LearnPathshala
              </div>

              <div className="text-xs font-medium text-blue-100">
                Learn. Practice. Succeed.
              </div>
            </div>
          </Link>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
            Join LearnPathshala
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white">
            Start your journey with{' '}
            <span className="text-[#FFB52E]">
              LearnPathshala
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-lg leading-8 text-blue-100">
            Whether you&apos;re here to learn, teach, or manage,
            LearnPathshala gives you the tools to grow and
            succeed.
          </p>

          {/* =================================================
              FEATURES
          ================================================== */}

          <div className="mt-8 space-y-4">
            {[
              'Live classes with real-time interaction',
              'Interactive quizzes and mock tests',
              'Role-based dashboards for students and teachers',
              'Track learning progress and performance',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-white"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                  <span className="text-sm font-bold text-[#FFB52E]">
                    ✓
                  </span>
                </div>

                <span className="text-sm">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* =================================================
              ROLE INFO
          ================================================== */}

          <div className="mt-10 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <GraduationCap className="h-5 w-5 text-[#FFB52E]" />

              <p className="mt-2 text-sm font-bold text-white">
                Student
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Learn & practice
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <BookOpen className="h-5 w-5 text-[#FFB52E]" />

              <p className="mt-2 text-sm font-bold text-white">
                Teacher
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Teach & inspire
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <Shield className="h-5 w-5 text-[#FFB52E]" />

              <p className="mt-2 text-sm font-bold text-white">
                Admin
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Manage platform
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="relative flex items-center justify-between border-t border-white/10 pt-6">
          <p className="text-sm text-blue-100">
            © {new Date().getFullYear()} LearnPathshala
          </p>

          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
            Learn. Practice. Succeed.
          </div>
        </div>
      </div>
    </div>
  );
}