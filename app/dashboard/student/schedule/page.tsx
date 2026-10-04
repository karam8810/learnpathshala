'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Clock, Video } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function StudentSchedulePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
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

    const { data } = await supabase
      .from('live_classes')
      .select('*, courses(title), profiles!live_classes_teacher_id_fkey(full_name)')
      .in('course_id', courseIds)
      .order('start_time', { ascending: true });

    setClasses(data || []);
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const now = new Date();
  const upcoming = classes.filter(c => new Date(c.start_time) >= now);

  const groupedByDay: Record<string, any[]> = {};
  upcoming.forEach(c => {
    const dayKey = new Date(c.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
    groupedByDay[dayKey].push(c);
  });

  return (
    <DashboardShell role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
        <p className="text-sm text-slate-500">Upcoming live class schedule</p>
      </div>

      {upcoming.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">No upcoming classes scheduled.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDay).map(([day, dayClasses]) => (
            <div key={day}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{day}</h2>
              <div className="space-y-3">
                {dayClasses.map((c) => (
                  <Card key={c.id} className="border-slate-200 shadow-sm">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-sky-100">
                        <span className="text-xs font-medium text-sky-600">
                          {new Date(c.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-red-500" />
                          <span className="font-semibold text-slate-900">{c.title}</span>
                          {c.status === 'live' && <span className="live-dot" />}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span>{c.courses?.title}</span>
                          <span>-</span>
                          <span>{c.profiles?.full_name}</span>
                          <span>-</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {c.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <Badge variant={c.status === 'live' ? 'destructive' : 'outline'}>{c.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
