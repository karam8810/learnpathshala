/*
# Fix Course Workflow Privileged Actions

## Overview
Moves course approval-state and admin pricing changes into protected database functions. Teachers cannot directly update admin-controlled columns, so submitting for review now uses an authorized function. Admin pricing, approval, publishing, and discount changes also use an admin-only function.

## New Functions
- `submit_course_for_review` - Allows the course owner to submit only their own draft or rejected course.
- `admin_manage_course` - Allows admins to update final price, approval status, publication state, rejection reason, and discounts.

## Security
- Both functions use `auth.uid()` from the active session.
- Teacher submissions require course ownership and draft/rejected state.
- Admin management requires the caller's profile role to be admin.
- Function execution is revoked from anonymous users and granted only to authenticated users.
*/

CREATE OR REPLACE FUNCTION public.submit_course_for_review(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = p_course_id
    AND teacher_id = auth.uid()
    AND admin_status IN ('draft', 'rejected')
  ) THEN
    RAISE EXCEPTION 'Course cannot be submitted';
  END IF;

  UPDATE public.courses
  SET admin_status = 'pending_review', rejection_reason = NULL, updated_at = now()
  WHERE id = p_course_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_course_for_review(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_course_for_review(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_course_for_review(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_manage_course(
  p_course_id uuid,
  p_status text DEFAULT NULL,
  p_final_price numeric DEFAULT NULL,
  p_discount_price numeric DEFAULT NULL,
  p_discount_active boolean DEFAULT NULL,
  p_discount_expires_at timestamptz DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('draft', 'pending_review', 'approved', 'rejected', 'published', 'unpublished') THEN
    RAISE EXCEPTION 'Invalid course status';
  END IF;

  IF p_final_price IS NOT NULL AND p_final_price < 0 THEN
    RAISE EXCEPTION 'Invalid final price';
  END IF;

  IF p_discount_price IS NOT NULL AND p_discount_price < 0 THEN
    RAISE EXCEPTION 'Invalid discount price';
  END IF;

  UPDATE public.courses
  SET
    admin_status = COALESCE(p_status, admin_status),
    final_price = COALESCE(p_final_price, final_price),
    discount_price = COALESCE(p_discount_price, discount_price),
    discount_active = COALESCE(p_discount_active, discount_active),
    discount_expires_at = CASE
      WHEN p_discount_expires_at IS NOT NULL THEN p_discount_expires_at
      WHEN p_discount_active = false THEN NULL
      ELSE discount_expires_at
    END,
    rejection_reason = CASE
      WHEN p_rejection_reason IS NOT NULL THEN p_rejection_reason
      WHEN p_status IN ('approved', 'published') THEN NULL
      ELSE rejection_reason
    END,
    published_at = CASE
      WHEN p_status = 'published' THEN now()
      WHEN p_status = 'unpublished' THEN NULL
      ELSE published_at
    END,
    updated_at = now()
  WHERE id = p_course_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_manage_course(uuid, text, numeric, numeric, boolean, timestamptz, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_manage_course(uuid, text, numeric, numeric, boolean, timestamptz, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_manage_course(uuid, text, numeric, numeric, boolean, timestamptz, text) TO authenticated;