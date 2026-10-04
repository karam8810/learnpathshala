/*
# Add Mock Question Solution Videos

## Overview
Adds optional video solutions to individual mock-test questions. Admins and assigned teachers can upload videos while creating or managing questions, and eligible students can watch them after opening an allowed test.

## Modified Tables
- `mock_test_questions.solution_video_path` - Private Storage path for the optional solution video.

## Storage
- Creates the private `mock-solution-videos` bucket.
- Allows admins and the responsible teacher to upload and manage videos under `{user_id}/{question_id}/...`.
- Allows students to read a video only when they can access the related free, preview, or purchased mock test.

## Security
- Videos are private and served through signed URLs.
- Storage policies check the linked question and mock-test entitlement server-side.
*/

ALTER TABLE public.mock_test_questions ADD COLUMN IF NOT EXISTS solution_video_path text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('mock-solution-videos', 'mock-solution-videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "mock_solution_videos_select" ON storage.objects;
CREATE POLICY "mock_solution_videos_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'mock-solution-videos' AND EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE split_part(name, '/', 2)::uuid = q.id
    AND (
      public.is_admin() OR t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid()
      OR t.is_free
      OR EXISTS (SELECT 1 FROM public.mock_test_series_tests st WHERE st.test_id = t.id AND st.is_free_preview)
      OR EXISTS (
        SELECT 1 FROM public.mock_test_series_tests st
        JOIN public.mock_test_series_purchases sp ON sp.series_id = st.series_id
        WHERE st.test_id = t.id AND sp.student_id = auth.uid() AND sp.status = 'active' AND sp.expires_at > now()
      )
    )
  )
);

DROP POLICY IF EXISTS "mock_solution_videos_insert" ON storage.objects;
CREATE POLICY "mock_solution_videos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'mock-solution-videos' AND split_part(name, '/', 1) = auth.uid()::text AND EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE split_part(name, '/', 2)::uuid = q.id
    AND (public.is_admin() OR t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "mock_solution_videos_update" ON storage.objects;
CREATE POLICY "mock_solution_videos_update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'mock-solution-videos' AND split_part(name, '/', 1) = auth.uid()::text
) WITH CHECK (
  bucket_id = 'mock-solution-videos' AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS "mock_solution_videos_delete" ON storage.objects;
CREATE POLICY "mock_solution_videos_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'mock-solution-videos' AND (public.is_admin() OR split_part(name, '/', 1) = auth.uid()::text)
);
