/*
# Add recording_url to live_classes

## Overview
Adds a `recording_url` column to the `live_classes` table so teachers can attach a recording link when a class ends. Students can then watch recorded classes from their dashboard.

## Modified Tables
- `live_classes` - Added `recording_url` (text, nullable) column to store the recording link.

## Security
- No policy changes needed. Existing RLS policies already cover the new column.
*/

ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS recording_url text;