'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, BookOpen, Video, Brain, Users, Plus, ArrowRight,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function TeacherOverviewPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ courses: 0, liveClasses: 0, quizzes: 0, students: 0 });
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'teacher')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile?.role === 'teacher' && user) {
      fetchData();
    }
  }, [profile, user]);

  const fetchData = async () => {
    const [courses, liveClasses, quizzes, enrollments] = await Promise.all([
      supabase.from('courses').select('id').eq('teacher_id', user!.id),
      supabase.from('live_classes').select('*, courses(title)').eq('teacher_id', user!.id).order('start_time', { ascending: true }).limit(5),
      supabase.from('quizzes').select('id').eq('teacher_id', user!.id),
      supabase.from('enrollments').select('id').in('course_id',
        (await supabase.from('courses').select('id').eq('teacher_id', user!.id)).data?.map(c => c.id) || []
      ),
    ]);

    setStats({
      courses: courses.data?.length || 0,
      liveClasses: liveClasses.data?.length || 0,
      quizzes: quizzes.data?.length || 0,
      students: enrollments.data?.length || 0,
    });
    setUpcomingClasses(liveClasses.data || []);
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
    { label: 'My Courses', value: stats.courses, icon: BookOpen, color: 'from-emerald-500 to-green-500', href: '/dashboard/teacher/courses' },
    { label: 'Live Classes', value: stats.liveClasses, icon: Video, color: 'from-red-500 to-rose-500', href: '/dashboard/teacher/live-classes' },
    { label: 'Quizzes', value: stats.quizzes, icon: Brain, color: 'from-pink-500 to-rose-500', href: '/dashboard/teacher/quizzes' },
    { label: 'Students', value: stats.students, icon: Users, color: 'from-sky-500 to-cyan-500', href: '/dashboard/teacher/courses' },
  ];

  return (
    <DashboardShell role="teacher">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile?.full_name?.split(' ')[0]}!</h1>
        <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your classes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
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
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-red-500" /> Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming classes.</p>
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
                    <Badge variant={c.status === 'live' ? 'destructive' : 'outline'}>{c.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/teacher/courses">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Create a new course
                </Button>
              </Link>
              <Link href="/dashboard/teacher/live-classes">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Schedule a live class
                </Button>
              </Link>
              <Link href="/dashboard/teacher/quizzes">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Create a quiz
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
