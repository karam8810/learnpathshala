/*
# Add Mock Series Purchases and Access Rules

## Overview
Adds student ownership records and secure server functions for purchasing complete mock-test series through PayU.

## New Table
- `mock_test_series_purchases` - Student ownership, paid amount, status, and expiry date.

## Security
- RLS is enabled and students can only read their own purchases.
- Payment creation and completion are restricted to server functions.
- Paid test access is granted only through an active, unexpired series purchase.
*/
CREATE TABLE IF NOT EXISTS public.mock_test_series_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.mock_test_series(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.mock_series_payment_transactions(id) ON DELETE SET NULL,
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded')),
  purchased_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
  UNIQUE(series_id, student_id)
);
ALTER TABLE public.mock_test_series_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "series_purchases_select_own_or_admin" ON public.mock_test_series_purchases;
CREATE POLICY "series_purchases_select_own_or_admin" ON public.mock_test_series_purchases FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "series_purchases_insert_blocked" ON public.mock_test_series_purchases;
CREATE POLICY "series_purchases_insert_blocked" ON public.mock_test_series_purchases FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "series_purchases_update_blocked" ON public.mock_test_series_purchases;
CREATE POLICY "series_purchases_update_blocked" ON public.mock_test_series_purchases FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "series_purchases_delete_admin" ON public.mock_test_series_purchases;
CREATE POLICY "series_purchases_delete_admin" ON public.mock_test_series_purchases FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "mock_tests_select" ON public.mock_tests;
CREATE POLICY "mock_tests_select" ON public.mock_tests FOR SELECT TO authenticated USING (
  public.is_admin() OR created_by = auth.uid() OR assigned_teacher_id = auth.uid() OR (
    status = 'published' AND (is_free OR EXISTS (
      SELECT 1 FROM public.mock_test_series_tests st
      JOIN public.mock_test_series_purchases sp ON sp.series_id = st.series_id
      WHERE st.test_id = mock_tests.id AND sp.student_id = auth.uid() AND sp.status = 'active' AND sp.expires_at > now()
    ))
  )
);
DROP POLICY IF EXISTS "mock_questions_select" ON public.mock_test_questions;
CREATE POLICY "mock_questions_select" ON public.mock_test_questions FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t WHERE t.id = mock_test_questions.test_id AND (
      t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid() OR (t.status = 'published' AND (t.is_free OR EXISTS (
        SELECT 1 FROM public.mock_test_series_tests st JOIN public.mock_test_series_purchases sp ON sp.series_id = st.series_id
        WHERE st.test_id = t.id AND sp.student_id = auth.uid() AND sp.status = 'active' AND sp.expires_at > now()
      )))
    )
  )
);

CREATE OR REPLACE FUNCTION public.create_mock_series_payment(p_series_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_student_id uuid := auth.uid(); v_series public.mock_test_series%ROWTYPE; v_existing public.mock_test_series_purchases%ROWTYPE; v_txnid text;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_series FROM public.mock_test_series WHERE id = p_series_id AND status = 'published';
  IF v_series IS NULL THEN RAISE EXCEPTION 'Series not available'; END IF;
  SELECT * INTO v_existing FROM public.mock_test_series_purchases WHERE series_id = p_series_id AND student_id = v_student_id AND status = 'active' AND expires_at > now();
  IF v_existing IS NOT NULL THEN RAISE EXCEPTION 'Already purchased'; END IF;
  IF v_series.is_free OR v_series.price <= 0 THEN RAISE EXCEPTION 'This series is free'; END IF;
  UPDATE public.mock_series_payment_transactions SET status = 'cancelled', updated_at = now() WHERE series_id = p_series_id AND student_id = v_student_id AND status = 'pending';
  v_txnid := 'MTS' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  INSERT INTO public.mock_series_payment_transactions (txnid, series_id, student_id, amount) VALUES (v_txnid, p_series_id, v_student_id, v_series.price);
  RETURN jsonb_build_object('txnid', v_txnid, 'amount', v_series.price, 'series_id', p_series_id, 'series_title', v_series.title);
END; $$;
REVOKE ALL ON FUNCTION public.create_mock_series_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_mock_series_payment(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_mock_series_payment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_mock_series_payment(p_txnid text, p_status text, p_payu_payment_id text DEFAULT NULL, p_payu_response jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_txn public.mock_series_payment_transactions%ROWTYPE; v_series public.mock_test_series%ROWTYPE; v_purchase_id uuid; v_expiry timestamptz;
BEGIN
  SELECT * INTO v_txn FROM public.mock_series_payment_transactions WHERE txnid = p_txnid;
  IF v_txn IS NULL THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF v_txn.status <> 'pending' THEN RAISE EXCEPTION 'Transaction already processed'; END IF;
  UPDATE public.mock_series_payment_transactions SET status = p_status, payu_payment_id = COALESCE(p_payu_payment_id, payu_payment_id), payu_response = COALESCE(p_payu_response, payu_response), updated_at = now() WHERE id = v_txn.id;
  IF p_status <> 'success' THEN RETURN jsonb_build_object('status', p_status); END IF;
  SELECT * INTO v_series FROM public.mock_test_series WHERE id = v_txn.series_id;
  v_expiry := now() + make_interval(days => v_series.validity_days);
  INSERT INTO public.mock_test_series_purchases (series_id, student_id, transaction_id, amount_paid, expires_at)
  VALUES (v_txn.series_id, v_txn.student_id, v_txn.id, v_txn.amount, v_expiry)
  ON CONFLICT (series_id, student_id) DO UPDATE SET transaction_id = EXCLUDED.transaction_id, amount_paid = EXCLUDED.amount_paid, status = 'active', purchased_at = now(), expires_at = EXCLUDED.expires_at
  RETURNING id INTO v_purchase_id;
  RETURN jsonb_build_object('status', 'success', 'purchase_id', v_purchase_id, 'expires_at', v_expiry);
END; $$;
REVOKE ALL ON FUNCTION public.complete_mock_series_payment(text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_mock_series_payment(text, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_mock_series_payment(text, text, text, jsonb) TO authenticated;
CREATE INDEX IF NOT EXISTS idx_series_tests_series ON public.mock_test_series_tests(series_id);
CREATE INDEX IF NOT EXISTS idx_series_tests_test ON public.mock_test_series_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_series_purchases_student ON public.mock_test_series_purchases(student_id);
CREATE INDEX IF NOT EXISTS idx_series_transactions_txnid ON public.mock_series_payment_transactions(txnid);
