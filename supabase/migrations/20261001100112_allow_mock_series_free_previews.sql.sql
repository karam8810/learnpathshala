/*
# Allow Mock Series Free Previews

## Overview
Allows students to view and attempt tests that an admin marks as free previews inside a paid series.

## Security
Only published preview tests are exposed; paid tests still require an active unexpired series purchase.
*/
DROP POLICY IF EXISTS "mock_tests_select" ON public.mock_tests;
CREATE POLICY "mock_tests_select" ON public.mock_tests FOR SELECT TO authenticated USING (
  public.is_admin() OR created_by = auth.uid() OR assigned_teacher_id = auth.uid()
  OR (status = 'published' AND is_free)
  OR (status = 'published' AND EXISTS (
    SELECT 1 FROM public.mock_test_series_tests preview_link
    WHERE preview_link.test_id = mock_tests.id AND preview_link.is_free_preview = true
  ))
  OR (status = 'published' AND EXISTS (
    SELECT 1 FROM public.mock_test_series_tests purchase_link
    JOIN public.mock_test_series_purchases purchase ON purchase.series_id = purchase_link.series_id
    WHERE purchase_link.test_id = mock_tests.id AND purchase.student_id = auth.uid() AND purchase.status = 'active' AND purchase.expires_at > now()
  ))
);
DROP POLICY IF EXISTS "mock_questions_select" ON public.mock_test_questions;
CREATE POLICY "mock_questions_select" ON public.mock_test_questions FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_questions.test_id
    AND (
      t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid()
      OR (t.status = 'published' AND t.is_free)
      OR (t.status = 'published' AND EXISTS (SELECT 1 FROM public.mock_test_series_tests preview_link WHERE preview_link.test_id = t.id AND preview_link.is_free_preview = true))
      OR (t.status = 'published' AND EXISTS (
        SELECT 1 FROM public.mock_test_series_tests purchase_link
        JOIN public.mock_test_series_purchases purchase ON purchase.series_id = purchase_link.series_id
        WHERE purchase_link.test_id = t.id AND purchase.student_id = auth.uid() AND purchase.status = 'active' AND purchase.expires_at > now()
      ))
    )
  )
);
