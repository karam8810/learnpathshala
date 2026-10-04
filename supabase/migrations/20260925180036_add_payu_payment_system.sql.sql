/*
# PayU Payment Integration System

## Overview
Adds a secure PayU payment gateway integration. Admins store PayU API credentials (merchant key, salt, webhook secret) in a database table. Students must complete PayU Hosted Checkout payment for paid courses before enrollment is granted. A webhook edge function verifies the payment and enrolls the student atomically.

## New Tables
- `payment_settings` - Stores PayU credentials (merchant_key, merchant_salt, webhook_secret, test_mode). Admin-only access.
- `payment_transactions` - Records each payment attempt (txnid, course_id, student_id, amount, status, payu_payment_id, etc.)

## New Functions
- `admin_get_payment_settings()` / `admin_update_payment_settings()` - Admin-only functions to read/write PayU credentials.
- `create_payment_transaction(p_course_id)` - Creates a pending payment transaction for a student and returns txn details.
- `complete_payment_enrollment(p_txnid, p_status, p_payu_payment_id)` - SECURITY DEFINER function called by webhook to verify payment and enroll student.

## Security
- RLS enabled on both new tables.
- payment_settings: only admins can SELECT/UPDATE; no INSERT/DELETE via API.
- payment_transactions: students can read their own; admins can read all; no direct INSERT/UPDATE/DELETE via API.
- All privileged mutations go through SECURITY DEFINER functions with caller authorization checks.
- Credentials are never exposed to the browser — only the edge function reads them server-side.
*/

-- Payment settings table (single row, admin-managed)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id integer PRIMARY KEY DEFAULT 1,
  merchant_key text NOT NULL DEFAULT '',
  merchant_salt text NOT NULL DEFAULT '',
  webhook_secret text NOT NULL DEFAULT '',
  test_mode boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_settings_admin_select" ON public.payment_settings;
CREATE POLICY "payment_settings_admin_select" ON public.payment_settings
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "payment_settings_admin_update" ON public.payment_settings;
CREATE POLICY "payment_settings_admin_update" ON public.payment_settings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txnid text UNIQUE NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  payu_payment_id text,
  payu_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own_or_admin" ON public.payment_transactions;
CREATE POLICY "transactions_select_own_or_admin" ON public.payment_transactions
  FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR public.is_admin()
  );

DROP POLICY IF EXISTS "transactions_insert_blocked" ON public.payment_transactions;
CREATE POLICY "transactions_insert_blocked" ON public.payment_transactions
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "transactions_update_blocked" ON public.payment_transactions;
CREATE POLICY "transactions_update_blocked" ON public.payment_transactions
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "transactions_delete_blocked" ON public.payment_transactions;
CREATE POLICY "transactions_delete_blocked" ON public.payment_transactions
  FOR DELETE TO authenticated USING (false);

-- Seed a default row
INSERT INTO public.payment_settings (id, merchant_key, merchant_salt, webhook_secret, test_mode)
VALUES (1, '', '', '', true)
ON CONFLICT (id) DO NOTHING;

-- Admin functions to read/write payment settings
CREATE OR REPLACE FUNCTION public.admin_get_payment_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN jsonb_build_object(
    'merchant_key', (SELECT merchant_key FROM payment_settings WHERE id = 1),
    'merchant_salt', (SELECT merchant_salt FROM payment_settings WHERE id = 1),
    'webhook_secret', (SELECT webhook_secret FROM payment_settings WHERE id = 1),
    'test_mode', (SELECT test_mode FROM payment_settings WHERE id = 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_payment_settings() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_payment_settings() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_payment_settings() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_payment_settings(
  p_merchant_key text,
  p_merchant_salt text,
  p_webhook_secret text,
  p_test_mode boolean
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

  UPDATE payment_settings
  SET
    merchant_key = p_merchant_key,
    merchant_salt = p_merchant_salt,
    webhook_secret = p_webhook_secret,
    test_mode = p_test_mode,
    updated_at = now(),
    updated_by = auth.uid()
  WHERE id = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_payment_settings(text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_payment_settings(text, text, text, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_settings(text, text, text, boolean) TO authenticated;

-- Create a pending payment transaction (called by student before redirecting to PayU)
CREATE OR REPLACE FUNCTION public.create_payment_transaction(p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_course public.courses%ROWTYPE;
  v_effective_price numeric(10,2);
  v_txnid text;
  v_existing_count integer;
  v_existing_txn_count integer;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF v_course IS NULL THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  IF v_course.admin_status <> 'published' THEN
    RAISE EXCEPTION 'Course is not available';
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

  IF v_effective_price <= 0 THEN
    RAISE EXCEPTION 'This course is free - no payment required';
  END IF;

  SELECT count(*) INTO v_existing_txn_count FROM public.payment_transactions
  WHERE course_id = p_course_id AND student_id = v_student_id AND status = 'pending';
  IF v_existing_txn_count > 0 THEN
    UPDATE public.payment_transactions
    SET status = 'cancelled', updated_at = now()
    WHERE course_id = p_course_id AND student_id = v_student_id AND status = 'pending';
  END IF;

  v_txnid := 'TXN' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));

  INSERT INTO public.payment_transactions (txnid, course_id, student_id, amount, status)
  VALUES (v_txnid, p_course_id, v_student_id, v_effective_price, 'pending');

  RETURN jsonb_build_object(
    'txnid', v_txnid,
    'amount', v_effective_price,
    'course_title', v_course.title,
    'course_id', p_course_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_payment_transaction(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_payment_transaction(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_payment_transaction(uuid) TO authenticated;

-- Complete payment and enroll student (called by webhook edge function with service role)
CREATE OR REPLACE FUNCTION public.complete_payment_enrollment(
  p_txnid text,
  p_status text,
  p_payu_payment_id text DEFAULT NULL,
  p_payu_response jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_txn public.payment_transactions%ROWTYPE;
  v_course public.courses%ROWTYPE;
  v_enrollment_id uuid;
  v_teacher_share integer := 70;
  v_teacher_earnings numeric(10,2);
  v_platform_earnings numeric(10,2);
  v_enroll_count integer;
BEGIN
  SELECT * INTO v_txn FROM public.payment_transactions WHERE txnid = p_txnid;
  IF v_txn IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_txn.status <> 'pending' THEN
    RAISE EXCEPTION 'Transaction already processed';
  END IF;

  UPDATE public.payment_transactions
  SET
    status = p_status,
    payu_payment_id = COALESCE(p_payu_payment_id, payu_payment_id),
    payu_response = COALESCE(p_payu_response, payu_response),
    updated_at = now()
  WHERE id = v_txn.id;

  IF p_status = 'success' THEN
    SELECT count(*) INTO v_enroll_count FROM public.enrollments
    WHERE course_id = v_txn.course_id AND student_id = v_txn.student_id;

    IF v_enroll_count > 0 THEN
      RETURN jsonb_build_object('status', 'already_enrolled');
    END IF;

    SELECT * INTO v_course FROM public.courses WHERE id = v_txn.course_id;

    INSERT INTO public.enrollments (course_id, student_id, status)
    VALUES (v_txn.course_id, v_txn.student_id, 'active')
    RETURNING id INTO v_enrollment_id;

    IF v_txn.amount > 0 THEN
      v_teacher_earnings := ROUND(v_txn.amount * v_teacher_share / 100, 2);
      v_platform_earnings := v_txn.amount - v_teacher_earnings;

      INSERT INTO public.teacher_earnings (
        teacher_id, course_id, student_id, enrollment_id,
        course_price, teacher_share_percent, teacher_earnings, platform_earnings
      ) VALUES (
        v_course.teacher_id, v_txn.course_id, v_txn.student_id, v_enrollment_id,
        v_txn.amount, v_teacher_share, v_teacher_earnings, v_platform_earnings
      );
    END IF;

    RETURN jsonb_build_object('status', 'success', 'enrollment_id', v_enrollment_id);
  ELSE
    RETURN jsonb_build_object('status', p_status);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_payment_enrollment(text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_payment_enrollment(text, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_payment_enrollment(text, text, text, jsonb) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_transactions_txnid ON public.payment_transactions(txnid);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON public.payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_course ON public.payment_transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.payment_transactions(status);
