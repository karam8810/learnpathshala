'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function SiteHeader() {
  const { user, profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardLink = profile
    ? `/dashboard/${profile.role}`
    : '/login';

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/95 backdrop-blur-xl">

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center"
        >
          <Image
            src="/learnpathshalalogo.png"
            alt="LearnPathshala"
            width={230}
            height={90}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <div className="hidden items-center gap-8 md:flex">
             <Link
            href="/about"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
          >
            Contact
          </Link>
          <Link
            href="/courses"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
          >
            Courses
          </Link>

          <Link
            href="/mock-tests"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
          >
            Mock Tests
          </Link>

       

          <Link
            href="/blog"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
            >
            Blog
          </Link>
          <Link
            href="/previous-year-papers"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
          >
            Previous Year Papers
          </Link>
          <Link
            href="/current-affairs"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#063B8F]"
          >
            Current Affairs
          </Link>

        </div>

        {/* =====================================================
            DESKTOP ACTIONS
        ===================================================== */}

        <div className="hidden items-center gap-3 md:flex">

          {loading ? (

            <div className="h-10 w-28 animate-pulse rounded-xl bg-blue-100" />

          ) : user && profile ? (

            <Link href={dashboardLink}>
              <Button
                className="
                  bg-gradient-to-r
                  from-[#063B8F]
                  to-[#0B63CE]
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-900/20
                  transition
                  hover:from-[#052f73]
                  hover:to-[#084fa8]
                "
              >
                Dashboard

                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

          ) : (

            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="
                    font-semibold
                    text-[#063B8F]
                    hover:bg-blue-50
                    hover:text-[#063B8F]
                  "
                >
                  Sign In
                </Button>
              </Link>

              <Link href="/register">
                <Button
                  className="
                    bg-gradient-to-r
                    from-[#063B8F]
                    to-[#0B63CE]
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-900/20
                    transition
                    hover:from-[#052f73]
                    hover:to-[#084fa8]
                  "
                >
                  Get Started

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>

          )}

        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? 'Close menu'
              : 'Open menu'
          }
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen((previous) => !previous)
          }
          className="
            rounded-xl
            p-2
            text-[#063B8F]
            transition
            hover:bg-blue-50
            md:hidden
          "
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

      </nav>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-blue-100 bg-white md:hidden">

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

            <div className="flex flex-col gap-1">

              <Link
                href="/courses"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-[#063B8F]
                "
              >
                Courses
              </Link>

              <Link
                href="/mock-tests"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-[#063B8F]
                "
              >
                Mock Tests
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-[#063B8F]
                "
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-[#063B8F]
                "
              >
                Contact
              </Link>

              <Link
                href="/blog"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-[#063B8F]
                "
              >
                Blog
              </Link>

              <Link
                href="/current-affairs"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-[#063B8F]
                "
              >
                Current Affairs
              </Link>

            </div>

            {/* =================================================
                MOBILE ACTIONS
            ================================================= */}

            <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">

              {loading ? (

                <div className="h-10 w-full animate-pulse rounded-xl bg-blue-100" />

              ) : user && profile ? (

                <Link
                  href={dashboardLink}
                  className="w-full"
                  onClick={closeMobileMenu}
                >
                  <Button
                    className="
                      w-full
                      bg-gradient-to-r
                      from-[#063B8F]
                      to-[#0B63CE]
                      text-white
                    "
                  >
                    Go to Dashboard

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

              ) : (

                <>
                  <Link
                    href="/login"
                    className="flex-1"
                    onClick={closeMobileMenu}
                  >
                    <Button
                      variant="outline"
                      className="
                        w-full
                        border-[#063B8F]/20
                        text-[#063B8F]
                      "
                    >
                      Sign In
                    </Button>
                  </Link>

                  <Link
                    href="/register"
                    className="flex-1"
                    onClick={closeMobileMenu}
                  >
                    <Button
                      className="
                        w-full
                        bg-gradient-to-r
                        from-[#063B8F]
                        to-[#0B63CE]
                        text-white
                      "
                    >
                      Get Started
                    </Button>
                  </Link>
                </>

              )}

            </div>

          </div>

        </div>
      )}

    </header>
  );
}