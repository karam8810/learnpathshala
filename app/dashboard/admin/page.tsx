'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  BookOpen,
  Video,
  Brain,
  TrendingUp,
  Loader2,
  GraduationCap,
  UserCheck,
  Activity,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function AdminOverviewPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    courses: 0,
    liveClasses: 0,
    quizzes: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    const [profiles, courses, liveClasses, quizzes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*'),
      supabase.from('live_classes').select('*, courses(title)').order('start_time', { ascending: false }).limit(5),
      supabase.from('quizzes').select('*'),
    ]);

    const allProfiles = profiles.data || [];
    setStats({
      totalUsers: allProfiles.length,
      teachers: allProfiles.filter((p: any) => p.role === 'teacher').length,
      students: allProfiles.filter((p: any) => p.role === 'student').length,
      courses: courses.data?.length || 0,
      liveClasses: liveClasses.data?.length || 0,
      quizzes: quizzes.data?.length || 0,
    });
    setRecentUsers(allProfiles.slice(0, 5));
    setRecentClasses(liveClasses.data || []);
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
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-sky-500 to-cyan-500' },
    { label: 'Teachers', value: stats.teachers, icon: GraduationCap, color: 'from-emerald-500 to-green-500' },
    { label: 'Students', value: stats.students, icon: UserCheck, color: 'from-amber-500 to-orange-500' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'from-violet-500 to-purple-500' },
    { label: 'Live Classes', value: stats.liveClasses, icon: Video, color: 'from-red-500 to-rose-500' },
    { label: 'Quizzes', value: stats.quizzes, icon: Brain, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <DashboardShell role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500">Platform-wide statistics and recent activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
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
        {/* Recent users */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-sky-500" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-slate-500">No users yet.</p>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {u.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{u.full_name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'default' : u.role === 'teacher' ? 'secondary' : 'outline'}>
                      {u.role}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent live classes */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-red-500" /> Recent Live Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClasses.length === 0 ? (
                <p className="text-sm text-slate-500">No live classes scheduled.</p>
              ) : (
                recentClasses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <Video className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-500">
                        {c.courses?.title} - {new Date(c.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={c.status === 'live' ? 'destructive' : c.status === 'completed' ? 'secondary' : 'outline'}>
                      {c.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
