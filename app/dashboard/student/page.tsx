'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, BookOpen, Video, Brain, Award, TrendingUp, ArrowRight, Calendar,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function StudentOverviewPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ enrolled: 0, upcomingClasses: 0, quizzesTaken: 0, avgScore: 0 });
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
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
      .select('course_id, courses(id, title)')
      .eq('student_id', user!.id);
    const courseIds = (enrollments || []).map(e => e.course_id);

    const { data: liveClasses } = await supabase
      .from('live_classes')
      .select('*, courses(title)')
      .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    const { data: submissions } = await supabase
      .from('submissions')
      .select('*, quizzes(title)')
      .eq('student_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const avgScore = submissions?.length
      ? Math.round(submissions.reduce((acc, s) => acc + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0) / submissions.length)
      : 0;

    setStats({
      enrolled: enrollments?.length || 0,
      upcomingClasses: liveClasses?.length || 0,
      quizzesTaken: submissions?.length || 0,
      avgScore,
    });
    setUpcomingClasses(liveClasses || []);
    setRecentSubmissions(submissions || []);
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Enrolled Courses', value: stats.enrolled, icon: BookOpen, color: 'from-amber-500 to-orange-500' },
    { label: 'Upcoming Classes', value: stats.upcomingClasses, icon: Video, color: 'from-red-500 to-rose-500' },
    { label: 'Quizzes Taken', value: stats.quizzesTaken, icon: Brain, color: 'from-pink-500 to-rose-500' },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: Award, color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <DashboardShell role="student">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile?.full_name?.split(' ')[0]}!</h1>
        <p className="text-sm text-slate-500">Continue your learning journey</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-red-500" /> Upcoming Live Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming classes. Enroll in a course to see classes here.</p>
              ) : (
                upcomingClasses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <Video className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.courses?.title} - {new Date(c.start_time).toLocaleString()}</div>
                    </div>
                    {c.status === 'live' && <span className="live-dot" />}
                    <Badge variant={c.status === 'live' ? 'destructive' : 'outline'}>{c.status}</Badge>
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard/student/live-classes" className="mt-4 block">
              <Button variant="outline" className="w-full">View all classes <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" /> Recent Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-sm text-slate-500">No quizzes taken yet. Take your first quiz!</p>
              ) : (
                recentSubmissions.map((s) => {
                  const score = s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : 0;
                  return (
                    <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${score >= 70 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        <Award className={`h-5 w-5 ${score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">{s.quizzes?.title || 'Quiz'}</div>
                        <div className="text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString()}</div>
                      </div>
                      <Badge variant={score >= 70 ? 'default' : 'secondary'} className={score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                        {score}%
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
            <Link href="/dashboard/student/quizzes" className="mt-4 block">
              <Button variant="outline" className="w-full">View all quizzes <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
