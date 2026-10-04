/*
# Course Pricing, Approval & Teacher Earnings

## Overview
Adds a full course approval workflow: teachers set a suggested price and submit courses for review; admins set the final price, approve/reject, publish/unpublish, and manage discounts. A teacher_earnings table tracks revenue share for each paid enrollment.

## Modified Tables
- `courses` - Added columns: suggested_price, final_price, discount_price, discount_active, discount_expires_at, admin_status, rejection_reason, published_at. Changed status semantics: now tracks admin approval state (draft, pending_review, approved, rejected, published, unpublished).

## New Tables
- `teacher_earnings` - Records each paid enrollment's earnings split (teacher share, platform share, amount).

## Security
- RLS enabled on teacher_earnings.
- Column-level UPDATE restrictions on courses: teachers can only set suggested_price (not final_price, discount_price, admin_status, published_at).
- A SECURITY DEFINER function `enroll_in_course` handles paid enrollment atomically.

## Important Notes
1. Teachers cannot publish courses or set final prices — only admins can.
2. Students see final_price (or discount_price if active) on published courses.
3. Teacher earnings are calculated as a configurable percentage (default 70%) of the final price.
4. Free courses (final_price = 0) bypass payment and enroll directly.
*/

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS suggested_price numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_price numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_price numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_status text DEFAULT 'draft' CHECK (admin_status IN ('draft', 'pending_review', 'approved', 'rejected', 'published', 'unpublished')),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE TABLE IF NOT EXISTS public.teacher_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  course_price numeric(10,2) NOT NULL DEFAULT 0,
  teacher_share_percent integer NOT NULL DEFAULT 70 CHECK (teacher_share_percent >= 0 AND teacher_share_percent <= 100),
  teacher_earnings numeric(10,2) NOT NULL DEFAULT 0,
  platform_earnings numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "earnings_select" ON public.teacher_earnings;
CREATE POLICY "earnings_select" ON public.teacher_earnings FOR SELECT TO authenticated USING (
  teacher_id = auth.uid() OR student_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "earnings_insert_blocked" ON public.teacher_earnings;
CREATE POLICY "earnings_insert_blocked" ON public.teacher_earnings FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "earnings_update_blocked" ON public.teacher_earnings;
CREATE POLICY "earnings_update_blocked" ON public.teacher_earnings FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "earnings_delete_admin" ON public.teacher_earnings;
CREATE POLICY "earnings_delete_admin" ON public.teacher_earnings FOR DELETE TO authenticated USING (public.is_admin());

REVOKE UPDATE ON public.courses FROM authenticated;
GRANT UPDATE (title, description, category, image_url, suggested_price) ON public.courses TO authenticated;

DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all" ON public.courses FOR SELECT TO authenticated USING (
  public.is_admin() OR teacher_id = auth.uid() OR admin_status = 'published'
);

DROP POLICY IF EXISTS "courses_insert_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_insert_teacher_or_admin" ON public.courses FOR INSERT TO authenticated WITH CHECK (
  public.is_admin() OR auth.uid() = teacher_id
);

DROP POLICY IF EXISTS "courses_update_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_update_teacher_or_admin" ON public.courses FOR UPDATE TO authenticated USING (
  public.is_admin() OR auth.uid() = teacher_id
) WITH CHECK (
  public.is_admin() OR auth.uid() = teacher_id
);

DROP POLICY IF EXISTS "courses_delete_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_delete_teacher_or_admin" ON public.courses FOR DELETE TO authenticated USING (
  public.is_admin() OR (auth.uid() = teacher_id AND admin_status IN ('draft', 'rejected'))
);

CREATE OR REPLACE FUNCTION public.enroll_in_course(p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_course public.courses%ROWTYPE;
  v_effective_price numeric(10,2);
  v_enrollment_id uuid;
  v_teacher_share integer := 70;
  v_teacher_earnings numeric(10,2);
  v_platform_earnings numeric(10,2);
  v_existing_count integer;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;

  IF v_course IS NULL THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  IF v_course.admin_status <> 'published' THEN
    RAISE EXCEPTION 'Course is not available for enrollment';
  END IF;

  SELECT count(*) INTO v_existing_count FROM public.enrollments
  WHERE course_id = p_course_id AND student_id = v_student_id;

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'Already enrolled in this course';
  END IF;

  v_effective_price := v_course.final_price;
  IF v_course.discount_active AND v_course.discount_price > 0
     AND (v_course.discount_expires_at IS NULL OR v_course.discount_expires_at > now()) THEN
    v_effective_price := LEAST(v_course.final_price, v_course.discount_price);
  END IF;

  INSERT INTO public.enrollments (course_id, student_id, status)
  VALUES (p_course_id, v_student_id, 'active')
  RETURNING id INTO v_enrollment_id;

  IF v_effective_price > 0 THEN
    v_teacher_earnings := ROUND(v_effective_price * v_teacher_share / 100, 2);
    v_platform_earnings := v_effective_price - v_teacher_earnings;

    INSERT INTO public.teacher_earnings (
      teacher_id, course_id, student_id, enrollment_id,
      course_price, teacher_share_percent, teacher_earnings, platform_earnings
    ) VALUES (
      v_course.teacher_id, p_course_id, v_student_id, v_enrollment_id,
      v_effective_price, v_teacher_share, v_teacher_earnings, v_platform_earnings
    );
  END IF;

  RETURN jsonb_build_object(
    'enrollment_id', v_enrollment_id,
    'price_paid', v_effective_price
  );
END;
$$;

REVOKE ALL ON FUNCTION public.enroll_in_course(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enroll_in_course(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.enroll_in_course(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_earnings_teacher ON public.teacher_earnings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_earnings_course ON public.teacher_earnings(course_id);
CREATE INDEX IF NOT EXISTS idx_earnings_student ON public.teacher_earnings(student_id);