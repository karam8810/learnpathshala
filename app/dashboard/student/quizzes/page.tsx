'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Brain, Award, ChevronRight, CheckCircle2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function StudentQuizzesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'student')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile?.role === 'student' && user) {
      fetchData();
    }
  }, [profile, user]);

  const fetchData = async () => {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user!.id);
    const courseIds = (enrollments || []).map(e => e.course_id);

    if (courseIds.length === 0) {
      setDataLoading(false);
      return;
    }

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*, courses(title)')
      .in('course_id', courseIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setQuizzes(quizData || []);

    const { data: subData } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', user!.id);

    const subMap: Record<string, any[]> = {};
    (subData || []).forEach(s => {
      if (!subMap[s.quiz_id]) subMap[s.quiz_id] = [];
      subMap[s.quiz_id].push(s);
    });
    setSubmissions(subMap);
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <DashboardShell role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
        <p className="text-sm text-slate-500">Take quizzes from your enrolled courses</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="py-16 text-center">
          <Brain className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">No quizzes available. Enroll in courses to see quizzes here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => {
            const userSubs = submissions[q.id] || [];
            const hasTaken = userSubs.length > 0;
            const bestScore = userSubs.length > 0
              ? Math.max(...userSubs.map(s => s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : 0))
              : 0;

            return (
              <Card key={q.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                      <Brain className="h-5 w-5 text-pink-600" />
                    </div>
                    {hasTaken && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{q.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{q.description || 'No description'}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="outline">{q.time_limit_minutes} min</Badge>
                    <span>{q.courses?.title}</span>
                  </div>

                  {hasTaken && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-700">Best score: {bestScore}%</span>
                    </div>
                  )}

                  <Link href={`/dashboard/student/quizzes/${q.id}`} className="mt-4 block">
                    <Button className={`w-full ${hasTaken ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
                      {hasTaken ? 'Retake Quiz' : 'Start Quiz'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
