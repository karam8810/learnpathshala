/*
# Restrict Mock Solution Video Uploads

## Overview
Adds storage-level limits for optional mock question solution videos.

## Storage Changes
- Limits each solution video to 100 MB.
- Allows common video formats only.

## Security
These limits are enforced by Supabase Storage, not only by the upload form.
*/
UPDATE storage.buckets
SET public = false,
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
WHERE id = 'mock-solution-videos';
