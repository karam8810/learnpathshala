/*
# ShaanAcademy Mock Test System

## Overview
Adds a complete mock-test workflow for admins, teachers, and students. Admins control publishing, approval, pricing, limits, assignment, and analytics. Teachers create tests and questions, add explanations and images, then submit tests for approval. Students take published tests and receive server-calculated scores and performance history.

## New Tables
- `mock_tests` - Test series metadata, ownership, approval status, pricing, exam/category/course, timing, and attempt limit.
- `mock_test_questions` - Student-visible question text, options, explanation, and optional image.
- `mock_test_answer_keys` - Private answer key used only by the server scorer and authorized staff.
- `mock_test_attempts` - One scored attempt per student/test run with score, percentage, and timing.
- `mock_test_answers` - Student selections for each attempt.

## Security
- RLS is enabled on every new table.
- Admins can manage all mock-test content and results.
- Teachers can manage tests they create or that an admin assigns to them.
- Students can only see published tests, their own attempts, and their own answers.
- Answer keys are never readable by students.
- Direct attempt inserts are blocked; `submit_mock_test` validates publication, attempt limits, ownership, and scoring on the server.

## Important Notes
1. Correct answers are stored separately from student-visible questions.
2. Paid/free and price fields are included for catalog control; payment processing is intentionally not included.
3. Rankings are calculated from completed attempts and are visible through authorized result queries.
*/

CREATE TABLE IF NOT EXISTS public.mock_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  exam_name text NOT NULL DEFAULT 'General',
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'published', 'unpublished')),
  is_free boolean NOT NULL DEFAULT true,
  price numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  attempt_limit integer NOT NULL DEFAULT 1 CHECK (attempt_limit > 0 AND attempt_limit <= 100),
  time_limit_minutes integer NOT NULL DEFAULT 30 CHECK (time_limit_minutes > 0 AND time_limit_minutes <= 600),
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mock_test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  question_order integer NOT NULL DEFAULT 1 CHECK (question_order > 0),
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation text,
  image_url text,
  points integer NOT NULL DEFAULT 1 CHECK (points > 0 AND points <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(test_id, question_order)
);

CREATE TABLE IF NOT EXISTS public.mock_test_answer_keys (
  question_id uuid PRIMARY KEY REFERENCES public.mock_test_questions(id) ON DELETE CASCADE,
  correct_answer integer NOT NULL CHECK (correct_answer >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mock_test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  total_points integer NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(test_id, student_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS public.mock_test_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.mock_test_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.mock_test_questions(id) ON DELETE CASCADE,
  selected_answer integer NOT NULL CHECK (selected_answer >= -1),
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_answers ENABLE ROW LEVEL SECURITY;

-- Tests: public catalog access is restricted to published tests for signed-in students.
DROP POLICY IF EXISTS "mock_tests_select" ON public.mock_tests;
CREATE POLICY "mock_tests_select" ON public.mock_tests FOR SELECT TO authenticated USING (
  public.is_admin() OR created_by = auth.uid() OR assigned_teacher_id = auth.uid() OR status = 'published'
);

DROP POLICY IF EXISTS "mock_tests_insert" ON public.mock_tests;
CREATE POLICY "mock_tests_insert" ON public.mock_tests FOR INSERT TO authenticated WITH CHECK (
  public.is_admin() OR (created_by = auth.uid() AND (assigned_teacher_id IS NULL OR assigned_teacher_id = auth.uid()))
);

DROP POLICY IF EXISTS "mock_tests_update" ON public.mock_tests;
CREATE POLICY "mock_tests_update" ON public.mock_tests FOR UPDATE TO authenticated USING (
  public.is_admin() OR created_by = auth.uid() OR assigned_teacher_id = auth.uid()
) WITH CHECK (
  public.is_admin() OR created_by = auth.uid() OR assigned_teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "mock_tests_delete" ON public.mock_tests;
CREATE POLICY "mock_tests_delete" ON public.mock_tests FOR DELETE TO authenticated USING (
  public.is_admin() OR (created_by = auth.uid() AND status IN ('draft', 'rejected'))
);

-- Questions: students can read questions for published tests, not answer keys.
DROP POLICY IF EXISTS "mock_questions_select" ON public.mock_test_questions;
CREATE POLICY "mock_questions_select" ON public.mock_test_questions FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_questions.test_id
    AND (t.status = 'published' OR t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "mock_questions_insert" ON public.mock_test_questions;
CREATE POLICY "mock_questions_insert" ON public.mock_test_questions FOR INSERT TO authenticated WITH CHECK (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_questions.test_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
);

DROP POLICY IF EXISTS "mock_questions_update" ON public.mock_test_questions;
CREATE POLICY "mock_questions_update" ON public.mock_test_questions FOR UPDATE TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_questions.test_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
) WITH CHECK (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_questions.test_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
);

DROP POLICY IF EXISTS "mock_questions_delete" ON public.mock_test_questions;
CREATE POLICY "mock_questions_delete" ON public.mock_test_questions FOR DELETE TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_questions.test_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
);

-- Answer keys are only visible to admins and the responsible teacher.
DROP POLICY IF EXISTS "mock_keys_select" ON public.mock_test_answer_keys;
CREATE POLICY "mock_keys_select" ON public.mock_test_answer_keys FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE q.id = mock_test_answer_keys.question_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "mock_keys_insert" ON public.mock_test_answer_keys;
CREATE POLICY "mock_keys_insert" ON public.mock_test_answer_keys FOR INSERT TO authenticated WITH CHECK (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE q.id = mock_test_answer_keys.question_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
);

DROP POLICY IF EXISTS "mock_keys_update" ON public.mock_test_answer_keys;
CREATE POLICY "mock_keys_update" ON public.mock_test_answer_keys FOR UPDATE TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE q.id = mock_test_answer_keys.question_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
) WITH CHECK (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE q.id = mock_test_answer_keys.question_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
);

DROP POLICY IF EXISTS "mock_keys_delete" ON public.mock_test_answer_keys;
CREATE POLICY "mock_keys_delete" ON public.mock_test_answer_keys FOR DELETE TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_test_questions q
    JOIN public.mock_tests t ON t.id = q.test_id
    WHERE q.id = mock_test_answer_keys.question_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    AND t.status IN ('draft', 'rejected')
  )
);

-- Attempts: students see their own, staff see attempts for their tests. Inserts are only through the scorer.
DROP POLICY IF EXISTS "mock_attempts_select" ON public.mock_test_attempts;
CREATE POLICY "mock_attempts_select" ON public.mock_test_attempts FOR SELECT TO authenticated USING (
  student_id = auth.uid() OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_tests t
    WHERE t.id = mock_test_attempts.test_id
    AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "mock_attempts_insert_blocked" ON public.mock_test_attempts;
CREATE POLICY "mock_attempts_insert_blocked" ON public.mock_test_attempts FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "mock_attempts_update_blocked" ON public.mock_test_attempts;
CREATE POLICY "mock_attempts_update_blocked" ON public.mock_test_attempts FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "mock_attempts_delete_own_or_admin" ON public.mock_test_attempts;
CREATE POLICY "mock_attempts_delete_own_or_admin" ON public.mock_test_attempts FOR DELETE TO authenticated USING (student_id = auth.uid() OR public.is_admin());

-- Answers follow the attempt visibility rules.
DROP POLICY IF EXISTS "mock_answers_select" ON public.mock_test_answers;
CREATE POLICY "mock_answers_select" ON public.mock_test_answers FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.mock_test_attempts a
    WHERE a.id = mock_test_answers.attempt_id
    AND (a.student_id = auth.uid() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.mock_tests t
      WHERE t.id = a.test_id AND (t.created_by = auth.uid() OR t.assigned_teacher_id = auth.uid())
    ))
  )
);

DROP POLICY IF EXISTS "mock_answers_insert_blocked" ON public.mock_test_answers;
CREATE POLICY "mock_answers_insert_blocked" ON public.mock_test_answers FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "mock_answers_update_blocked" ON public.mock_test_answers;
CREATE POLICY "mock_answers_update_blocked" ON public.mock_test_answers FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "mock_answers_delete_own_or_admin" ON public.mock_test_answers;
CREATE POLICY "mock_answers_delete_own_or_admin" ON public.mock_test_answers FOR DELETE TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.mock_test_attempts a WHERE a.id = mock_test_answers.attempt_id AND a.student_id = auth.uid()
  )
);

-- Server-side scorer. The client sends only question IDs and selected option indexes.
CREATE OR REPLACE FUNCTION public.submit_mock_test(p_test_id uuid, p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_attempt_count integer;
  v_attempt_limit integer;
  v_attempt_number integer;
  v_attempt_id uuid;
  v_score integer := 0;
  v_total integer := 0;
  v_question record;
  v_answer jsonb;
  v_selected integer;
  v_correct boolean;
  v_percentage numeric(5,2);
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'Invalid answers';
  END IF;

  SELECT attempt_limit INTO v_attempt_limit
  FROM public.mock_tests
  WHERE id = p_test_id AND status = 'published';

  IF v_attempt_limit IS NULL THEN
    RAISE EXCEPTION 'Test unavailable';
  END IF;

  SELECT count(*)::integer INTO v_attempt_count
  FROM public.mock_test_attempts
  WHERE test_id = p_test_id AND student_id = v_student_id;

  IF v_attempt_count >= v_attempt_limit THEN
    RAISE EXCEPTION 'Attempt limit reached';
  END IF;

  v_attempt_number := v_attempt_count + 1;
  INSERT INTO public.mock_test_attempts (test_id, student_id, attempt_number)
  VALUES (p_test_id, v_student_id, v_attempt_number)
  RETURNING id INTO v_attempt_id;

  FOR v_question IN
    SELECT q.id, q.points, k.correct_answer
    FROM public.mock_test_questions q
    JOIN public.mock_test_answer_keys k ON k.question_id = q.id
    WHERE q.test_id = p_test_id
    ORDER BY q.question_order
  LOOP
    v_total := v_total + v_question.points;
    v_answer := COALESCE((SELECT item FROM jsonb_array_elements(p_answers) item WHERE item->>'question_id' = v_question.id::text LIMIT 1), '{}'::jsonb);
    v_selected := COALESCE((v_answer->>'selected_answer')::integer, -1);
    v_correct := v_selected = v_question.correct_answer;
    IF v_correct THEN
      v_score := v_score + v_question.points;
    END IF;

    INSERT INTO public.mock_test_answers (attempt_id, question_id, selected_answer, is_correct)
    VALUES (v_attempt_id, v_question.id, v_selected, v_correct);
  END LOOP;

  v_percentage := CASE WHEN v_total = 0 THEN 0 ELSE round((v_score::numeric / v_total::numeric) * 100, 2) END;

  UPDATE public.mock_test_attempts
  SET score = v_score, total_points = v_total, percentage = v_percentage, submitted_at = now()
  WHERE id = v_attempt_id;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'total_points', v_total,
    'percentage', v_percentage,
    'attempt_number', v_attempt_number
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_mock_test(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_mock_test(uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_mock_test(uuid, jsonb) TO authenticated;

-- Admin/teacher catalog and results indexes.
CREATE INDEX IF NOT EXISTS idx_mock_tests_status ON public.mock_tests(status);
CREATE INDEX IF NOT EXISTS idx_mock_tests_created_by ON public.mock_tests(created_by);
CREATE INDEX IF NOT EXISTS idx_mock_tests_assigned_teacher ON public.mock_tests(assigned_teacher_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_course ON public.mock_tests(course_id);
CREATE INDEX IF NOT EXISTS idx_mock_questions_test_order ON public.mock_test_questions(test_id, question_order);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_test ON public.mock_test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_student ON public.mock_test_attempts(student_id);

CREATE OR REPLACE FUNCTION public.update_mock_test_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mock_tests_updated_at ON public.mock_tests;
CREATE TRIGGER mock_tests_updated_at BEFORE UPDATE ON public.mock_tests
FOR EACH ROW EXECUTE FUNCTION public.update_mock_test_updated_at();