'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  BookOpen,
  Video,
  Brain,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Calendar,
  PlayCircle,
  ClipboardCheck,
  CreditCard,
  Layers,
  FileText,
  UserRound,
  Newspaper,
} from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

/* ============================================================
   TYPES
============================================================ */

type Role = 'admin' | 'teacher' | 'student';

/* ============================================================
   NAVIGATION
============================================================ */

const navItems: Record<
  Role,
  {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
  }[]
> = {
  admin: [
    {
      label: 'Overview',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
    },
    {
      label: 'Courses',
      href: '/dashboard/admin/courses',
      icon: BookOpen,
    },
    {
      label: 'Live Classes',
      href: '/dashboard/admin/live-classes',
      icon: Video,
    },
    {
      label: 'Mock Tests',
      href: '/dashboard/admin/mock-tests',
      icon: ClipboardCheck,
    },
    {
      label: 'Test Series',
      href: '/dashboard/admin/mock-test-series',
      icon: Layers,
    },
    {
      label: 'Blog',
      href: '/dashboard/admin/blog',
      icon: BookOpen,
    },
    {
  label: 'Current Affairs',
  href: '/dashboard/admin/current-affairs',
  icon: Newspaper,
},
{
  label: "Previous Year Papers",
  href: "/dashboard/admin/previous-year-papers",
  icon: FileText,
},
    {
      label: 'Payment Settings',
      href: '/dashboard/admin/payment-settings',
      icon: CreditCard,
    },
    {
      label: 'Analytics',
      href: '/dashboard/admin/analytics',
      icon: BarChart3,
    },
  ],

  teacher: [
    {
      label: 'Overview',
      href: '/dashboard/teacher',
      icon: LayoutDashboard,
    },
    {
      label: 'My Courses',
      href: '/dashboard/teacher/courses',
      icon: BookOpen,
    },
    {
      label: 'Live Classes',
      href: '/dashboard/teacher/live-classes',
      icon: Video,
    },
    {
      label: 'Mock Tests',
      href: '/dashboard/teacher/mock-tests',
      icon: ClipboardCheck,
    },
    {
      label: 'Quizzes',
      href: '/dashboard/teacher/quizzes',
      icon: Brain,
    },
  ],

  student: [
    {
      label: 'Overview',
      href: '/dashboard/student',
      icon: LayoutDashboard,
    },
    {
      label: 'My Courses',
      href: '/dashboard/student/courses',
      icon: BookOpen,
    },
    {
      label: 'Live Classes',
      href: '/dashboard/student/live-classes',
      icon: Video,
    },
    {
      label: 'Recorded Classes',
      href: '/dashboard/student/recorded-classes',
      icon: PlayCircle,
    },
    {
      label: 'Mock Tests',
      href: '/dashboard/student/mock-tests',
      icon: ClipboardCheck,
    },
    {
      label: 'Quizzes',
      href: '/dashboard/student/quizzes',
      icon: Brain,
    },
    {
      label: 'Schedule',
      href: '/dashboard/student/schedule',
      icon: Calendar,
    },
    {
      label: 'My Profile',
      href: '/dashboard/student/profile',
      icon: UserRound,
    },
  ],
};

/* ============================================================
   ROLE CONFIG
============================================================ */

const roleConfig: Record<
  Role,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  admin: {
    label: 'Admin',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },

  teacher: {
    label: 'Teacher',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },

  student: {
    label: 'Student',
    color: 'text-[#B77900]',
    bgColor: 'bg-amber-100',
  },
};

/* ============================================================
   DASHBOARD SIDEBAR
============================================================ */

export function DashboardSidebar({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { profile, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const items = navItems[role];
  const config = roleConfig[role];

  /* ==========================================================
     SIGN OUT
  ========================================================== */

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      {/* ======================================================
          MOBILE TOP BAR
      ======================================================= */}

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <img
              src="/learnpathshalalogo.png"
              alt="LearnPathshala"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="text-sm font-extrabold text-[#063B8F]">
              LearnPathshala
            </div>

            <div className="text-[10px] font-medium text-slate-500">
              Learn. Practice. Succeed.
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Toggle dashboard menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">

          {/* ==================================================
              LOGO
          =================================================== */}

          <div className="border-b border-slate-200 px-5 py-5">

            <Link
              href="/"
              className="flex items-center gap-3"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-md ring-1 ring-slate-200">
                <img
                  src="/learnpathshalalogo.png"
                  alt="LearnPathshala"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold tracking-tight text-[#063B8F]">
                  LearnPathshala
                </div>

                <div className="text-[10px] font-semibold text-slate-500">
                  Learn. Practice. Succeed.
                </div>
              </div>

            </Link>

          </div>

          {/* ==================================================
              ROLE BADGE
          =================================================== */}

          <div className="px-4 py-4">

            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold',
                config.bgColor,
                config.color,
              )}
            >

              <div className="h-2 w-2 rounded-full bg-current" />

              {config.label} Dashboard

            </div>

          </div>

          {/* ==================================================
              NAVIGATION
          =================================================== */}

          <nav className="flex-1 space-y-1 overflow-y-auto px-3">

            {items.map((item) => {

              const isActive =
                pathname === item.href ||
                (
                  item.href !== `/dashboard/${role}` &&
                  pathname.startsWith(
                    `${item.href}/`,
                  )
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-[#063B8F] shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#063B8F]',
                  )}
                >

                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive
                        ? 'text-[#063B8F]'
                        : 'text-slate-400 group-hover:text-[#0B63CE]',
                    )}
                  />

                  <span>
                    {item.label}
                  </span>

                </Link>
              );
            })}

          </nav>

          {/* ==================================================
              USER SECTION
          =================================================== */}

          <div className="border-t border-slate-200 p-4">

            <div className="mb-3 flex items-center gap-3">

              {/* Avatar */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#063B8F] to-[#0B63CE] text-sm font-bold text-white shadow-sm">
                {profile?.full_name
                  ?.charAt(0)
                  .toUpperCase() || 'U'}
              </div>

              {/* User details */}

              <div className="min-w-0 flex-1">

                <div className="truncate text-sm font-semibold text-slate-900">
                  {profile?.full_name ||
                    'User'}
                </div>

                <div className="truncate text-xs text-slate-500">
                  {profile?.email}
                </div>

              </div>

            </div>

            {/* Sign out */}

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />

              Sign Out
            </Button>

          </div>

        </div>
      </aside>

      {/* ======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}
    </>
  );
}

/* ============================================================
   DASHBOARD SHELL
============================================================ */

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      <DashboardSidebar role={role} />

      <div className="lg:pl-64">

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

      </div>

    </div>
  );
}