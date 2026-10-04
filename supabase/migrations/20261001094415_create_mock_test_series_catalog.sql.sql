/*
# Create Mock Test Series Catalog

## Overview
Creates the product catalog for complete mock-test series, including series metadata, included tests, and subject lists.

## New Tables
- `mock_test_series` - Published or draft series product details, price, and validity.
- `mock_test_series_tests` - Existing mock tests included in each series.
- `mock_test_series_subjects` - Subjects displayed for each series.

## Security
- RLS is enabled on all tables.
- Published catalog data is readable by signed-in students.
- Only admins can create, update, or delete series content.
*/
CREATE TABLE IF NOT EXISTS public.mock_test_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text,
  exam_name text NOT NULL DEFAULT 'General', category text NOT NULL DEFAULT 'General', image_url text,
  is_free boolean NOT NULL DEFAULT false, price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  original_price numeric(10,2) NOT NULL DEFAULT 0 CHECK (original_price >= 0), validity_days integer NOT NULL DEFAULT 365 CHECK (validity_days > 0 AND validity_days <= 3650),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  published_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mock_test_series_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), series_id uuid NOT NULL REFERENCES public.mock_test_series(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE, section_name text NOT NULL DEFAULT 'Full Length Mocks',
  test_order integer NOT NULL DEFAULT 1 CHECK (test_order > 0), is_free_preview boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(series_id, test_id), UNIQUE(series_id, section_name, test_order)
);
CREATE TABLE IF NOT EXISTS public.mock_test_series_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), series_id uuid NOT NULL REFERENCES public.mock_test_series(id) ON DELETE CASCADE,
  name text NOT NULL, subject_order integer NOT NULL DEFAULT 1 CHECK (subject_order > 0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(series_id, name)
);
ALTER TABLE public.mock_test_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_series_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_series_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "series_select_published_or_admin" ON public.mock_test_series;
CREATE POLICY "series_select_published_or_admin" ON public.mock_test_series FOR SELECT TO authenticated USING (public.is_admin() OR created_by = auth.uid() OR status = 'published');
DROP POLICY IF EXISTS "series_insert_admin" ON public.mock_test_series;
CREATE POLICY "series_insert_admin" ON public.mock_test_series FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "series_update_admin" ON public.mock_test_series;
CREATE POLICY "series_update_admin" ON public.mock_test_series FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "series_delete_admin" ON public.mock_test_series;
CREATE POLICY "series_delete_admin" ON public.mock_test_series FOR DELETE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "series_tests_select_catalog" ON public.mock_test_series_tests;
CREATE POLICY "series_tests_select_catalog" ON public.mock_test_series_tests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.mock_test_series s WHERE s.id = series_id AND (s.status = 'published' OR public.is_admin() OR s.created_by = auth.uid())));
DROP POLICY IF EXISTS "series_tests_insert_admin" ON public.mock_test_series_tests;
CREATE POLICY "series_tests_insert_admin" ON public.mock_test_series_tests FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "series_tests_update_admin" ON public.mock_test_series_tests;
CREATE POLICY "series_tests_update_admin" ON public.mock_test_series_tests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "series_tests_delete_admin" ON public.mock_test_series_tests;
CREATE POLICY "series_tests_delete_admin" ON public.mock_test_series_tests FOR DELETE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "series_subjects_select_catalog" ON public.mock_test_series_subjects;
CREATE POLICY "series_subjects_select_catalog" ON public.mock_test_series_subjects FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.mock_test_series s WHERE s.id = series_id AND (s.status = 'published' OR public.is_admin() OR s.created_by = auth.uid())));
DROP POLICY IF EXISTS "series_subjects_insert_admin" ON public.mock_test_series_subjects;
CREATE POLICY "series_subjects_insert_admin" ON public.mock_test_series_subjects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "series_subjects_update_admin" ON public.mock_test_series_subjects;
CREATE POLICY "series_subjects_update_admin" ON public.mock_test_series_subjects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "series_subjects_delete_admin" ON public.mock_test_series_subjects;
CREATE POLICY "series_subjects_delete_admin" ON public.mock_test_series_subjects FOR DELETE TO authenticated USING (public.is_admin());
