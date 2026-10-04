'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, TrendingUp, BookOpen, Video, Brain, Users } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAll();
    }
  }, [profile]);

  const fetchAll = async () => {
    const [profiles, courses, liveClasses, quizzes, enrollments, submissions] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('courses').select('*'),
      supabase.from('live_classes').select('*'),
      supabase.from('quizzes').select('*'),
      supabase.from('enrollments').select('*'),
      supabase.from('submissions').select('*'),
    ]);

    const allProfiles = profiles.data || [];
    const roleData = [
      { name: 'Admins', value: allProfiles.filter(p => p.role === 'admin').length, fill: 'hsl(199 89% 48%)' },
      { name: 'Teachers', value: allProfiles.filter(p => p.role === 'teacher').length, fill: 'hsl(160 60% 45%)' },
      { name: 'Students', value: allProfiles.filter(p => p.role === 'student').length, fill: 'hsl(38 92% 50%)' },
    ];

    const coursesByCategory: Record<string, number> = {};
    (courses.data || []).forEach(c => {
      coursesByCategory[c.category] = (coursesByCategory[c.category] || 0) + 1;
    });
    const categoryData = Object.entries(coursesByCategory).map(([name, value]) => ({ name, value }));

    const classStatusData = [
      { name: 'Scheduled', value: (liveClasses.data || []).filter(c => c.status === 'scheduled').length, fill: 'hsl(199 89% 48%)' },
      { name: 'Live', value: (liveClasses.data || []).filter(c => c.status === 'live').length, fill: 'hsl(0 84% 60%)' },
      { name: 'Completed', value: (liveClasses.data || []).filter(c => c.status === 'completed').length, fill: 'hsl(215 16% 47%)' },
      { name: 'Cancelled', value: (liveClasses.data || []).filter(c => c.status === 'cancelled').length, fill: 'hsl(38 92% 50%)' },
    ];

    setData({
      roleData,
      categoryData,
      classStatusData,
      totalEnrollments: (enrollments.data || []).length,
      totalSubmissions: (submissions.data || []).length,
      avgScore: submissions.data?.length
        ? Math.round(submissions.data.reduce((acc, s) => acc + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0) / submissions.data.length)
        : 0,
    });
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
    <DashboardShell role="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
        <p className="text-sm text-slate-500">Insights and statistics across the platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Enrollments</p>
                <p className="text-2xl font-bold text-slate-900">{data.totalEnrollments}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Quiz Submissions</p>
                <p className="text-2xl font-bold text-slate-900">{data.totalSubmissions}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                <Brain className="h-5 w-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Quiz Score</p>
                <p className="text-2xl font-bold text-slate-900">{data.avgScore}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                <BarChart3 className="h-5 w-5 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.roleData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Live Class Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.classStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.classStatusData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
