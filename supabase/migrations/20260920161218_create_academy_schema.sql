/*
# ShaanAcademy - Full Schema

## Overview
Creates the complete database schema for ShaanAcademy, an educational platform with three roles: admin, teacher, and student. Features courses, live classes, and quizzes.

## New Tables
1. **profiles** - Extends auth.users with role (admin/teacher/student), full_name, avatar_url
2. **courses** - Course catalog with title, description, teacher_id, category, status
3. **enrollments** - Links students to courses
4. **live_classes** - Scheduled live class sessions linked to courses
5. **quizzes** - Quizzes linked to courses with title, description, time_limit
6. **questions** - Multiple-choice questions for quizzes
7. **submissions** - Student quiz submissions with score
8. **answers** - Individual answers within a submission

## Security
- RLS enabled on every table
- Students can only see their own enrollments, submissions, answers
- Teachers can only manage their own courses, live classes, quizzes, questions
- Admins can manage everything via SECURITY DEFINER helper function
- All owner columns default to auth.uid()

## Important Notes
1. Role-based access: profiles.role drives what each user can do
2. Teachers own courses; students enroll in courses
3. Live classes and quizzes belong to courses
4. Quiz submissions are scored automatically
*/

-- 1. profiles table (created first so helper function can reference it)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper function: is_admin (after profiles exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text DEFAULT 'General',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "courses_insert_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_insert_teacher_or_admin" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() OR auth.uid() = teacher_id
  );

DROP POLICY IF EXISTS "courses_update_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_update_teacher_or_admin" ON public.courses
  FOR UPDATE TO authenticated USING (
    public.is_admin() OR auth.uid() = teacher_id
  ) WITH CHECK (
    public.is_admin() OR auth.uid() = teacher_id
  );

DROP POLICY IF EXISTS "courses_delete_teacher_or_admin" ON public.courses;
CREATE POLICY "courses_delete_teacher_or_admin" ON public.courses
  FOR DELETE TO authenticated USING (
    public.is_admin() OR auth.uid() = teacher_id
  );

-- 3. enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, student_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select" ON public.enrollments;
CREATE POLICY "enrollments_select" ON public.enrollments
  FOR SELECT TO authenticated USING (
    auth.uid() = student_id OR
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.courses WHERE courses.id = enrollments.course_id AND courses.teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "enrollments_insert_self" ON public.enrollments;
CREATE POLICY "enrollments_insert_self" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "enrollments_update_self_or_teacher" ON public.enrollments;
CREATE POLICY "enrollments_update_self_or_teacher" ON public.enrollments
  FOR UPDATE TO authenticated USING (
    auth.uid() = student_id OR
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.courses WHERE courses.id = enrollments.course_id AND courses.teacher_id = auth.uid())
  ) WITH CHECK (
    auth.uid() = student_id OR
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.courses WHERE courses.id = enrollments.course_id AND courses.teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "enrollments_delete_self_or_admin" ON public.enrollments;
CREATE POLICY "enrollments_delete_self_or_admin" ON public.enrollments
  FOR DELETE TO authenticated USING (
    auth.uid() = student_id OR public.is_admin()
  );

-- 4. live_classes table
CREATE TABLE IF NOT EXISTS public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  meeting_link text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "live_classes_select" ON public.live_classes;
CREATE POLICY "live_classes_select" ON public.live_classes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "live_classes_insert" ON public.live_classes;
CREATE POLICY "live_classes_insert" ON public.live_classes
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() OR auth.uid() = teacher_id
  );

DROP POLICY IF EXISTS "live_classes_update" ON public.live_classes;
CREATE POLICY "live_classes_update" ON public.live_classes
  FOR UPDATE TO authenticated USING (
    public.is_admin() OR auth.uid() = teacher_id
  ) WITH CHECK (
    public.is_admin() OR auth.uid() = teacher_id
  );

DROP POLICY IF EXISTS "live_classes_delete" ON public.live_classes;
CREATE POLICY "live_classes_delete" ON public.live_classes
  FOR DELETE TO authenticated USING (
    public.is_admin() OR auth.uid() = teacher_id
  );

-- 5. quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_limit_minutes int DEFAULT 30,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quizzes_select" ON public.quizzes;
CREATE POLICY "quizzes_select" ON public.quizzes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "quizzes_insert" ON public.quizzes;
CREATE POLICY "quizzes_insert" ON public.quizzes
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() OR auth.uid() = teacher_id
  );

DROP POLICY IF EXISTS "quizzes_update" ON public.quizzes;
CREATE POLICY "quizzes_update" ON public.quizzes
  FOR UPDATE TO authenticated USING (
    public.is_admin() OR auth.uid() = teacher_id
  ) WITH CHECK (
    public.is_admin() OR auth.uid() = teacher_id
  );

DROP POLICY IF EXISTS "quizzes_delete" ON public.quizzes;
CREATE POLICY "quizzes_delete" ON public.quizzes
  FOR DELETE TO authenticated USING (
    public.is_admin() OR auth.uid() = teacher_id
  );

-- 6. questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_select" ON public.questions;
CREATE POLICY "questions_select" ON public.questions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "questions_insert" ON public.questions;
CREATE POLICY "questions_insert" ON public.questions
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "questions_update" ON public.questions;
CREATE POLICY "questions_update" ON public.questions
  FOR UPDATE TO authenticated USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.teacher_id = auth.uid())
  ) WITH CHECK (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "questions_delete" ON public.questions;
CREATE POLICY "questions_delete" ON public.questions
  FOR DELETE TO authenticated USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.teacher_id = auth.uid())
  );

-- 7. submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  total_points int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_select" ON public.submissions;
CREATE POLICY "submissions_select" ON public.submissions
  FOR SELECT TO authenticated USING (
    auth.uid() = student_id OR
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = submissions.quiz_id AND quizzes.teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "submissions_insert_self" ON public.submissions;
CREATE POLICY "submissions_insert_self" ON public.submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "submissions_update_self" ON public.submissions;
CREATE POLICY "submissions_update_self" ON public.submissions
  FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "submissions_delete_self_or_admin" ON public.submissions;
CREATE POLICY "submissions_delete_self_or_admin" ON public.submissions
  FOR DELETE TO authenticated USING (
    auth.uid() = student_id OR public.is_admin()
  );

-- 8. answers table
CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer int NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "answers_select" ON public.answers;
CREATE POLICY "answers_select" ON public.answers
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = answers.submission_id AND submissions.student_id = auth.uid()) OR
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.submissions
      JOIN public.quizzes ON quizzes.id = submissions.quiz_id
      WHERE submissions.id = answers.submission_id AND quizzes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "answers_insert_self" ON public.answers;
CREATE POLICY "answers_insert_self" ON public.answers
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = answers.submission_id AND submissions.student_id = auth.uid())
  );

DROP POLICY IF EXISTS "answers_delete_self_or_admin" ON public.answers;
CREATE POLICY "answers_delete_self_or_admin" ON public.answers
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.submissions WHERE submissions.id = answers.submission_id AND submissions.student_id = auth.uid()) OR
    public.is_admin()
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_course ON public.live_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_teacher ON public.live_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_start_time ON public.live_classes(start_time);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON public.quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz ON public.submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission ON public.answers(submission_id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS live_classes_updated_at ON public.live_classes;
CREATE TRIGGER live_classes_updated_at BEFORE UPDATE ON public.live_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS quizzes_updated_at ON public.quizzes;
CREATE TRIGGER quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();