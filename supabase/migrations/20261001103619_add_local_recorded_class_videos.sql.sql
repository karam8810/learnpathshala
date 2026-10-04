/*
# Add Local Recorded Class Videos

## Overview
Adds private local video uploads for completed live classes. Admins and the responsible teacher can upload a recording from their dashboard, while enrolled students can watch it from Recorded Classes.

## Modified Tables
- `live_classes.recording_path` - Private Storage path for an uploaded class recording.

## Storage
- Creates the private `recorded-class-videos` bucket.
- Limits uploads to 500 MB and common video formats.
- Stores files under `{uploader_id}/{live_class_id}/...`.

## Security
- Only admins and the live class teacher can upload, replace, or delete a recording.
- Students can read a recording only when enrolled in the linked course.
- Existing external `recording_url` links continue to work.
*/

ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS recording_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recorded-class-videos', 'recorded-class-videos', false, 524288000,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

DROP POLICY IF EXISTS "recorded_class_videos_select" ON storage.objects;
CREATE POLICY "recorded_class_videos_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'recorded-class-videos' AND EXISTS (
    SELECT 1 FROM public.live_classes lc
    WHERE split_part(name, '/', 2)::uuid = lc.id
    AND (
      public.is_admin()
      OR lc.teacher_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.course_id = lc.course_id AND e.student_id = auth.uid() AND e.status IN ('active', 'completed')
      )
    )
  )
);

DROP POLICY IF EXISTS "recorded_class_videos_insert" ON storage.objects;
CREATE POLICY "recorded_class_videos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'recorded-class-videos' AND split_part(name, '/', 1) = auth.uid()::text AND EXISTS (
    SELECT 1 FROM public.live_classes lc
    WHERE split_part(name, '/', 2)::uuid = lc.id
    AND (public.is_admin() OR lc.teacher_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "recorded_class_videos_update" ON storage.objects;
CREATE POLICY "recorded_class_videos_update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'recorded-class-videos' AND split_part(name, '/', 1) = auth.uid()::text
) WITH CHECK (
  bucket_id = 'recorded-class-videos' AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS "recorded_class_videos_delete" ON storage.objects;
CREATE POLICY "recorded_class_videos_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'recorded-class-videos' AND (
    public.is_admin() OR split_part(name, '/', 1) = auth.uid()::text
  )
);
