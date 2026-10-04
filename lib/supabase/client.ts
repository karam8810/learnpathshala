'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'teacher' | 'student';
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  course_id: string;
  student_id: string;
  status: 'active' | 'completed' | 'dropped';
  created_at: string;
};

export type LiveClass = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  start_time: string;
  duration_minutes: number;
  meeting_link: string | null;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  time_limit_minutes: number;
  status: 'active' | 'draft' | 'closed';
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  points: number;
  created_at: string;
};

export type Submission = {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_points: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export type Answer = {
  id: string;
  submission_id: string;
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  created_at: string;
};
