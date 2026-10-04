'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Video, Calendar, Clock, Link2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function StudentLiveClassesPage() {
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

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    live: 'bg-red-100 text-red-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-amber-100 text-amber-700',
  };

  const now = new Date();
  const upcoming = classes.filter(c => new Date(c.start_time) >= now || c.status === 'live');
  const past = classes.filter(c => new Date(c.start_time) < now && c.status !== 'live');

  return (
    <DashboardShell role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Live Classes</h1>
        <p className="text-sm text-slate-500">Join your scheduled live class sessions</p>
      </div>

      {classes.length === 0 ? (
        <div className="py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">No live classes available. Enroll in courses to see classes here.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Upcoming & Live</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((c) => (
                  <Card key={c.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                          <Video className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          {c.status === 'live' && <span className="live-dot" />}
                          <Badge className={statusColor[c.status]}>{c.status}</Badge>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900">{c.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
                      <div className="mt-4 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(c.start_time).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {c.duration_minutes} minutes
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-3.5 w-3.5" />
                          {c.courses?.title} - {c.profiles?.full_name}
                        </div>
                      </div>
                      {c.status === 'live' && c.meeting_link && (
                        <a href={c.meeting_link} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                          <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                            <Link2 className="mr-2 h-4 w-4" /> Join Now
                          </Button>
                        </a>
                      )}
                      {c.status === 'scheduled' && c.meeting_link && (
                        <a href={c.meeting_link} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                          <Button variant="outline" className="w-full">
                            <Link2 className="mr-2 h-4 w-4" /> Meeting Link
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-500">Past Classes</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((c) => (
                  <Card key={c.id} className="border-slate-200 opacity-70">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Video className="h-5 w-5 text-slate-400" />
                        </div>
                        <Badge className={statusColor[c.status]}>{c.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-700">{c.title}</h3>
                      <div className="mt-2 text-xs text-slate-400">
                        {new Date(c.start_time).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
