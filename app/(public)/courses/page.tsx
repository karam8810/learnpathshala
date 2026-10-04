'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  ArrowRight,
  Search,
  IndianRupee,
  Tag,
  Sparkles,
  BookOpen,
  Loader2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';



import { supabase } from '@/lib/supabase/client';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH COURSES
  // ============================================================

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            profiles!courses_teacher_id_fkey(full_name)
          `)
          .eq('admin_status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching courses:', error);
          setCourses([]);
          return;
        }

        setCourses(data || []);
      } catch (error) {
        console.error('Unexpected error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ============================================================
  // EFFECTIVE PRICE
  // ============================================================

  const getEffectivePrice = (course: any) => {
    const discountIsValid =
      course.discount_active &&
      course.discount_price > 0 &&
      (!course.discount_expires_at ||
        new Date(course.discount_expires_at) > new Date());

    if (discountIsValid) {
      return Math.min(
        course.final_price || 0,
        course.discount_price
      );
    }

    return course.final_price || 0;
  };

  // ============================================================
  // DISCOUNT CHECK
  // ============================================================

  const hasDiscount = (course: any) => {
    return (
      course.discount_active &&
      course.discount_price > 0 &&
      course.discount_price < (course.final_price || 0) &&
      (!course.discount_expires_at ||
        new Date(course.discount_expires_at) > new Date())
    );
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const searchTerm = search.trim().toLowerCase();

  const filtered = courses.filter((course) => {
    const title = course.title?.toLowerCase() || '';
    const category = course.category?.toLowerCase() || '';
    const description = course.description?.toLowerCase() || '';

    return (
      title.includes(searchTerm) ||
      category.includes(searchTerm) ||
      description.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#063B8F] shadow-sm">
              <BookOpen className="h-4 w-4 text-[#F5A623]" />

              LearnPathshala Courses
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B8F] sm:text-5xl">
              Explore Our Courses
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Browse our courses, learn from experienced teachers and build
              the skills you need for your academic and competitive journey.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          COURSES
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* ====================================================
            SEARCH + RESULT COUNT
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search courses by title, category or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                h-12
                rounded-xl
                border-slate-200
                bg-white
                pl-11
                shadow-sm
                focus-visible:ring-[#063B8F]
              "
            />
          </div>

          {!loading && (
            <div className="text-sm font-medium text-slate-500">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'course' : 'courses'} found
            </div>
          )}
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-[#063B8F]" />

              <p className="text-sm font-medium text-slate-500">
                Loading courses...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                COURSE GRID
            ================================================== */}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => {
                const price = getEffectivePrice(course);
                const discounted = hasDiscount(course);

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group block h-full"
                  >
                    <Card
                      className="
                        h-full
                        overflow-hidden
                        rounded-2xl
                        border-slate-200
                        bg-white
                        shadow-sm
                        transition-all
                        duration-300
                        group-hover:-translate-y-1
                        group-hover:border-blue-200
                        group-hover:shadow-xl
                      "
                    >
                      <CardContent className="p-0">

                        {/* COURSE TOP */}

                        <div className="relative bg-gradient-to-br from-blue-50 via-white to-amber-50 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-gradient-to-br
                                from-[#063B8F]
                                to-[#0B63CE]
                                shadow-lg
                                shadow-blue-900/20
                              "
                            >
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>

                            {discounted && (
                              <Badge
                                className="
                                  border-0
                                  bg-emerald-100
                                  text-emerald-700
                                  hover:bg-emerald-100
                                "
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                Sale
                              </Badge>
                            )}
                          </div>

                          {/* CATEGORY */}

                          <div className="mt-5">
                            <Badge
                              variant="outline"
                              className="
                                border-blue-200
                                bg-white
                                text-[#063B8F]
                              "
                            >
                              {course.category || 'General'}
                            </Badge>
                          </div>
                        </div>

                        {/* COURSE CONTENT */}

                        <div className="p-5">
                          <h2
                            className="
                              line-clamp-2
                              text-lg
                              font-bold
                              text-[#063B8F]
                              transition-colors
                              group-hover:text-[#0B63CE]
                            "
                          >
                            {course.title}
                          </h2>

                          <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-6 text-slate-500">
                            {course.description ||
                              'No description available.'}
                          </p>

                          {/* TEACHER */}

                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-xs font-medium text-slate-400">
                              Instructor
                            </span>

                            <span className="max-w-[170px] truncate text-xs font-semibold text-slate-600">
                              {course.profiles?.full_name ||
                                'LearnPathshala'}
                            </span>
                          </div>

                          {/* PRICE */}

                          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            {price === 0 ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                                    <Sparkles className="h-4 w-4 text-emerald-600" />
                                  </div>

                                  <div>
                                    <p className="text-sm font-bold text-emerald-600">
                                      Free Course
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      Start learning today
                                    </p>
                                  </div>
                                </div>

                                <ArrowRight className="h-5 w-5 text-emerald-500 transition-transform group-hover:translate-x-1" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  {discounted && (
                                    <div className="mb-1 text-xs font-medium text-slate-400 line-through">
                                      ₹{course.final_price}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1">
                                    <IndianRupee className="h-5 w-5 text-[#063B8F]" />

                                    <span className="text-xl font-extrabold text-[#063B8F]">
                                      {price}
                                    </span>
                                  </div>
                                </div>

                                {discounted && (
                                  <Badge
                                    variant="outline"
                                    className="
                                      border-emerald-200
                                      bg-emerald-50
                                      text-emerald-700
                                    "
                                  >
                                    Save ₹
                                    {(
                                      course.final_price - price
                                    ).toFixed(0)}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* VIEW COURSE */}

                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-sm font-bold text-[#063B8F]">
                              View Course
                            </span>

                            <div
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-50
                                transition-all
                                group-hover:bg-[#063B8F]
                              "
                            >
                              <ArrowRight
                                className="
                                  h-4
                                  w-4
                                  text-[#063B8F]
                                  transition-all
                                  group-hover:translate-x-0.5
                                  group-hover:text-white
                                "
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* ==================================================
                NO COURSES
            ================================================== */}

            {filtered.length === 0 && (
              <div className="flex min-h-[350px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                    <Search className="h-7 w-7 text-[#063B8F]" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#063B8F]">
                    No courses found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try searching with a different course name or category.
                  </p>

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="mt-4 text-sm font-bold text-[#0B63CE] hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>


    </div>
  );
}