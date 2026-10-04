/*
# Create Mock Series Payment Transactions

## Overview
Creates the server-side transaction ledger used for PayU payments for mock-test series.

## New Table
- `mock_series_payment_transactions` - Stores transaction ID, series, student, amount, status, and PayU response data.

## Security
- RLS is enabled.
- Students can read only their own transactions; admins can read all.
- Direct client writes are blocked; payment functions perform writes.
*/
CREATE TABLE IF NOT EXISTS public.mock_series_payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txnid text UNIQUE NOT NULL,
  series_id uuid NOT NULL REFERENCES public.mock_test_series(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  payu_payment_id text,
  payu_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_series_payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "series_transactions_select_own_or_admin" ON public.mock_series_payment_transactions;
CREATE POLICY "series_transactions_select_own_or_admin" ON public.mock_series_payment_transactions FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "series_transactions_insert_blocked" ON public.mock_series_payment_transactions;
CREATE POLICY "series_transactions_insert_blocked" ON public.mock_series_payment_transactions FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "series_transactions_update_blocked" ON public.mock_series_payment_transactions;
CREATE POLICY "series_transactions_update_blocked" ON public.mock_series_payment_transactions FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "series_transactions_delete_admin" ON public.mock_series_payment_transactions;
CREATE POLICY "series_transactions_delete_admin" ON public.mock_series_payment_transactions FOR DELETE TO authenticated USING (public.is_admin());
