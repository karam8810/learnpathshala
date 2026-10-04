'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  IndianRupee,
  Tag,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  Video,
  LogIn,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';



import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const params = useParams();

  // ============================================================
  // URL SLUG
  // ============================================================

  const courseSlug = params.slug as string;

  const { user, profile } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // ============================================================
  // SAFE REDIRECT
  // ============================================================

  const getCourseRedirect = () => {
    return `/courses/${courseSlug}`;
  };

  // ============================================================
  // FETCH COURSE USING SLUG
  // ============================================================

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        if (!courseSlug) {
          setCourse(null);
          return;
        }

        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            profiles!courses_teacher_id_fkey(full_name)
          `)
          .eq('slug', courseSlug)
          .eq('admin_status', 'published')
          .maybeSingle();

        if (error) {
          console.error('Course fetch error:', error);
          setCourse(null);
          return;
        }

        if (!data) {
          setCourse(null);
          return;
        }

        setCourse(data);

        // ========================================================
        // IMPORTANT
        // Use UUID internally after finding the course by slug.
        // ========================================================

        if (user) {
          const {
            data: enrollment,
            error: enrollmentError,
          } = await supabase
            .from('enrollments')
            .select('id, status')
            .eq('course_id', data.id)
            .eq('student_id', user.id)
            .maybeSingle();

          if (enrollmentError) {
            console.error(
              'Enrollment check error:',
              enrollmentError
            );
          }

          setEnrolled(
            !!enrollment &&
              enrollment.status !== 'dropped'
          );
        } else {
          setEnrolled(false);
        }
      } catch (error) {
        console.error('Unexpected course error:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseSlug, user]);

  // ============================================================
  // EFFECTIVE PRICE
  // ============================================================

  const getEffectivePrice = (c: any) => {
    if (
      c?.discount_active &&
      c?.discount_price > 0 &&
      (!c?.discount_expires_at ||
        new Date(c.discount_expires_at) > new Date())
    ) {
      return Math.min(
        c.final_price || 0,
        c.discount_price
      );
    }

    return c?.final_price || 0;
  };

  // ============================================================
  // DISCOUNT
  // ============================================================

  const hasDiscount = (c: any) => {
    return (
      c?.discount_active &&
      c?.discount_price > 0 &&
      c.discount_price < (c.final_price || 0) &&
      (!c.discount_expires_at ||
        new Date(c.discount_expires_at) > new Date())
    );
  };

  // ============================================================
  // LOGIN / REGISTER REDIRECT
  // ============================================================

  const redirectToLogin = () => {
    const redirectUrl = getCourseRedirect();

    window.location.href =
      `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const redirectToRegister = () => {
    const redirectUrl = getCourseRedirect();

    window.location.href =
      `/register?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // ============================================================
  // ENROLL
  // ============================================================

  const handleEnroll = async () => {
    // ----------------------------------------------------------
    // 1. USER NOT LOGGED IN
    // ----------------------------------------------------------

    if (!user) {
      redirectToLogin();
      return;
    }

    // ----------------------------------------------------------
    // COURSE MUST EXIST
    // ----------------------------------------------------------

    if (!course?.id) {
      toast.error('Course information is not available.');
      return;
    }

    // ----------------------------------------------------------
    // 2. ONLY STUDENTS CAN ENROLL
    // ----------------------------------------------------------

    if (profile?.role !== 'student') {
      toast.error(
        'Only students can enroll in courses.'
      );

      return;
    }

    // ----------------------------------------------------------
    // 3. PREVENT DUPLICATE ENROLLMENT
    // ----------------------------------------------------------

    if (enrolled) {
      toast.info(
        'You are already enrolled in this course.'
      );

      return;
    }

    try {
      setEnrolling(true);

      // IMPORTANT:
      // URL uses slug
      // Database/payment uses UUID

      const courseId = course.id;

      const price = getEffectivePrice(course);

      // ========================================================
      // PAID COURSE
      // ========================================================

      if (price > 0) {
        const {
          data: sessionData,
        } = await supabase.auth.getSession();

        const token =
          sessionData.session?.access_token;

        if (!token) {
          toast.error(
            'Your session has expired. Please sign in again.'
          );

          redirectToLogin();

          return;
        }

        // ------------------------------------------------------
        // CREATE PAYU PAYMENT
        // ------------------------------------------------------

        const functionUrl =
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/payu-create-payment`;

        const response = await fetch(functionUrl, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            courseId,
          }),
        });

        // ------------------------------------------------------
        // PAYMENT API ERROR
        // ------------------------------------------------------

        if (!response.ok) {
          let errorMessage =
            'Could not start payment. Please try again.';

          try {
            const errorData =
              await response.json();

            if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Ignore JSON parsing error
          }

          toast.error(errorMessage);

          setEnrolling(false);

          return;
        }

        const payData =
          await response.json();

        // ------------------------------------------------------
        // PAYU FUNCTION ERROR
        // ------------------------------------------------------

        if (payData?.error) {
          toast.error(payData.error);

          setEnrolling(false);

          return;
        }

        // ------------------------------------------------------
        // VALIDATE PAYMENT RESPONSE
        // ------------------------------------------------------

        if (
          !payData.payu_url ||
          !payData.key ||
          !payData.txnid ||
          !payData.amount ||
          !payData.productinfo ||
          !payData.firstname ||
          !payData.email ||
          !payData.surl ||
          !payData.curl ||
          !payData.hash
        ) {
          console.error(
            'Invalid PayU response:',
            payData
          );

          toast.error(
            'Payment gateway returned an incomplete response.'
          );

          setEnrolling(false);

          return;
        }

        // ======================================================
        // SUBMIT PAYMENT FORM TO PAYU
        // ======================================================

        const form =
          document.createElement('form');

        form.method = 'POST';

        form.action =
          payData.payu_url;

        form.style.display = 'none';

        // ------------------------------------------------------
        // PAYU FIELDS
        // ------------------------------------------------------

        const fields: Record<string, string> = {
          key: String(payData.key),

          txnid: String(payData.txnid),

          amount: String(payData.amount),

          productinfo:
            String(payData.productinfo),

          firstname:
            String(payData.firstname),

          email:
            String(payData.email),

          phone:
            String(payData.phone || ''),

          surl:
            String(payData.surl),

          curl:
            String(payData.curl),

          hash:
            String(payData.hash),

          udf1: '',
          udf2: '',
          udf3: '',
          udf4: '',
          udf5: '',
          udf6: '',
          udf7: '',
          udf8: '',
          udf9: '',
          udf10: '',
        };

        // ------------------------------------------------------
        // ADD INPUTS
        // ------------------------------------------------------

        Object.entries(fields).forEach(
          ([name, value]) => {
            const input =
              document.createElement('input');

            input.type = 'hidden';

            input.name = name;

            input.value = value;

            form.appendChild(input);
          }
        );

        // ------------------------------------------------------
        // SUBMIT
        // ------------------------------------------------------

        document.body.appendChild(form);

        form.submit();

        return;
      }

      // ========================================================
      // FREE COURSE
      // ========================================================

      const { error } =
        await supabase.rpc(
          'enroll_in_course',
          {
            p_course_id: courseId,
          }
        );

      if (error) {
        console.error(
          'Free enrollment error:',
          error
        );

        if (
          error.message
            ?.toLowerCase()
            .includes('already enrolled')
        ) {
          toast.info(
            'You are already enrolled in this course.'
          );

          setEnrolled(true);
        } else {
          toast.error(
            error.message ||
              'Could not enroll in the course.'
          );
        }

        setEnrolling(false);

        return;
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      toast.success(
        'Enrolled successfully!'
      );

      setEnrolled(true);

      setEnrolling(false);
    } catch (error) {
      console.error(
        'Enrollment error:',
        error
      );

      toast.error(
        'Something went wrong. Please try again.'
      );

      setEnrolling(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#063B8F]" />

          <p className="text-sm font-medium text-slate-500">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // COURSE NOT FOUND
  // ============================================================

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col bg-blue-50">
   

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <BookOpen className="h-8 w-8 text-slate-300" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-[#063B8F]">
              Course not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The course you are looking for does not exist
              or is no longer available.
            </p>

            <Link
              href="/courses"
              className="mt-6 inline-block"
            >
              <Button
                variant="outline"
                className="border-[#063B8F]/20 text-[#063B8F]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />

                Back to Courses
              </Button>
            </Link>
          </div>
        </div>

      
      </div>
    );
  }

  // ============================================================
  // PRICE
  // ============================================================

  const price =
    getEffectivePrice(course);

  const discounted =
    hasDiscount(course);

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">


      {/* ====================================================
          BREADCRUMB
      ==================================================== */}

      <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
        <Link
          href="/courses"
          className="
            inline-flex
            items-center
            text-sm
            font-medium
            text-slate-500
            transition
            hover:text-[#063B8F]
          "
        >
          <ArrowLeft className="mr-2 h-4 w-4" />

          Back to Courses
        </Link>
      </div>

      {/* ====================================================
          COURSE HEADER
      ==================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">

          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="
                  border-blue-200
                  bg-blue-50
                  text-[#063B8F]
                "
              >
                {course.category || 'General'}
              </Badge>

              {discounted && (
                <Badge
                  className="
                    border-0
                    bg-amber-100
                    text-amber-800
                  "
                >
                  <Tag className="mr-1 h-3 w-3" />

                  Sale
                </Badge>
              )}
            </div>

            <h1
              className="
                mt-5
                text-3xl
                font-extrabold
                tracking-tight
                text-[#062E6F]
                sm:text-4xl
                lg:text-5xl
              "
            >
              {course.title}
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
              {course.description ||
                'No description available.'}
            </p>

            {/* COURSE INFO */}

            <div className="mt-7 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#063B8F]" />

                {course.profiles?.full_name ||
                  'Unknown Teacher'}
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#063B8F]" />

                {course.category || 'General'}
              </div>

              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#F5A623]" />

                Live classes included
              </div>
            </div>

            {/* ==================================================
                COURSE OVERVIEW CARD
            ================================================== */}

            <div className="mt-10 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <BookOpen className="h-5 w-5 text-[#063B8F]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#063B8F]">
                    About this course
                  </h2>

                  <p className="text-xs text-slate-500">
                    Everything you need to start learning
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-slate-600">
                {course.description ||
                  'This course provides structured learning material designed to help you improve your knowledge and preparation.'}
              </p>
            </div>
          </div>

          {/* ==================================================
              ENROLL CARD
          ================================================== */}

          <div className="lg:col-span-1">
            <Card
              className="
                sticky
                top-28
                overflow-hidden
                rounded-2xl
                border-blue-100
                bg-white
                shadow-xl
                shadow-blue-900/10
              "
            >
              <CardContent className="p-6">

                {/* PRICE */}

                <div
                  className="
                    rounded-2xl
                    bg-gradient-to-br
                    from-blue-50
                    via-white
                    to-amber-50
                    p-5
                  "
                >
                  {price === 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                      </div>

                      <div>
                        <span className="text-2xl font-extrabold text-emerald-600">
                          Free Course
                        </span>

                        <p className="mt-1 text-xs text-slate-500">
                          Start learning today
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        {discounted && (
                          <span className="text-lg text-slate-400 line-through">
                            ₹{course.final_price}
                          </span>
                        )}

                        <span className="flex items-center text-3xl font-extrabold text-[#063B8F]">
                          <IndianRupee className="h-6 w-6" />

                          {price}
                        </span>
                      </div>

                      {discounted && (
                        <Badge
                          variant="outline"
                          className="
                            mt-3
                            border-emerald-200
                            bg-emerald-50
                            text-emerald-700
                          "
                        >
                          Save ₹
                          {(
                            course.final_price -
                            price
                          ).toFixed(0)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* BENEFITS */}

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                    Full lifetime access
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                    Access to live classes
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                    Mock tests & quizzes
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="h-5 w-5 shrink-0 text-slate-400" />

                    Learn at your own pace
                  </div>
                </div>

                {/* BUTTON */}

                <div className="mt-7">
                  {enrolled ? (
                    <Link
                      href={`/dashboard/student/courses/${course.id}`}
                    >
                      <Button
                        className="
                          h-12
                          w-full
                          bg-gradient-to-r
                          from-[#063B8F]
                          to-[#0B63CE]
                          text-white
                          shadow-lg
                          shadow-blue-900/20
                          hover:from-[#052f73]
                          hover:to-[#084fa8]
                        "
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />

                        Continue Learning

                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="
                        h-12
                        w-full
                        bg-gradient-to-r
                        from-[#063B8F]
                        to-[#0B63CE]
                        text-white
                        shadow-lg
                        shadow-blue-900/20
                        transition
                        hover:-translate-y-0.5
                        hover:from-[#052f73]
                        hover:to-[#084fa8]
                      "
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                          Processing...
                        </>
                      ) : user ? (
                        price > 0
                          ? `Enroll for ₹${price}`
                          : 'Enroll for Free'
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />

                          Continue to Enroll
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* GUEST INFO */}

                {!user && !enrolled && (
                  <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                    Already have an account?{' '}

                    <Link
                      href={`/login?redirect=${encodeURIComponent(
                        getCourseRedirect()
                      )}`}
                      className="
                        font-semibold
                        text-[#063B8F]
                        hover:underline
                      "
                    >
                      Sign in
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ====================================================
          CTA
      ==================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#063B8F] to-[#0B63CE] px-6 py-10 text-center shadow-xl sm:px-10">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Join LearnPathshala and continue your preparation with structured
            courses, mock tests and practice resources.
          </p>

          {!enrolled && (
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="
                mt-6
                bg-gradient-to-r
                from-[#F5A623]
                to-[#FFB52E]
                font-bold
                text-[#063B8F]
                shadow-lg
                hover:from-[#e99a14]
                hover:to-[#f2a820]
              "
            >
              {enrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Processing...
                </>
              ) : (
                <>
                  {price > 0
                    ? `Enroll for ₹${price}`
                    : 'Enroll for Free'}

                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      
    </div>
  );
}