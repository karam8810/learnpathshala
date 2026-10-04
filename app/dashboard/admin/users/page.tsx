'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Search, Shield, BookOpen, GraduationCap, Eye, Phone, Mail, MapPin, CalendarDays, ShoppingBag, ClipboardCheck } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function AdminUsersPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<{ profile: any; courses: any[]; mockTests: any[] } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
        .then(({ data }) => {
          setUsers(data || []);
          setDataLoading(false);
        });
    }
  }, [profile]);

  const openStudentDetails = async (student: any) => {
    setSelectedStudent({ profile: student, courses: [], mockTests: [] });
    setDetailsLoading(true);
    const [enrollmentResult, purchaseResult] = await Promise.all([
      supabase.from('enrollments').select('id, status, created_at, courses(title, category, final_price)').eq('student_id', student.id).order('created_at', { ascending: false }),
      supabase.from('mock_test_series_purchases').select('id, amount_paid, status, purchased_at, expires_at, mock_test_series(title, exam_name, category)').eq('student_id', student.id).order('purchased_at', { ascending: false }),
    ]);
    setSelectedStudent({ profile: student, courses: enrollmentResult.data || [], mockTests: purchaseResult.data || [] });
    setDetailsLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleIcon: Record<string, typeof Shield> = {
    admin: Shield,
    teacher: BookOpen,
    student: GraduationCap,
  };

  const roleColor: Record<string, string> = {
    admin: 'bg-sky-100 text-sky-700',
    teacher: 'bg-emerald-100 text-emerald-700',
    student: 'bg-amber-100 text-amber-700',
  };

  return (
    <DashboardShell role="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500">View and manage all platform users</p>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Joined</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const Icon = roleIcon[u.role] || Users;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {u.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.phone || 'Not provided'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${roleColor[u.role]}`}>
                          <Icon className="h-3 w-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{u.role === 'student' && <button onClick={() => openStudentDetails(u)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-50"><Eye className="h-3.5 w-3.5" /> Details</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No users found.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
          {selectedStudent && <div className="space-y-6 py-2">
            <div className="rounded-xl bg-sky-50 p-5"><div className="flex items-start gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-xl font-bold text-white">{selectedStudent.profile.full_name?.charAt(0).toUpperCase()}</div><div><h3 className="text-lg font-bold text-slate-900">{selectedStudent.profile.full_name}</h3><div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><span className="flex items-center gap-2"><Mail className="h-4 w-4 text-sky-600" />{selectedStudent.profile.email}</span><span className="flex items-center gap-2"><Phone className="h-4 w-4 text-sky-600" />{selectedStudent.profile.phone || 'Not provided'}</span><span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />{selectedStudent.profile.address || 'Not provided'}</span><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-600" />Joined {new Date(selectedStudent.profile.created_at).toLocaleDateString()}</span></div></div></div></div>
            {detailsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-sky-500" /></div> : <div className="grid gap-5 sm:grid-cols-2"><div><h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><BookOpen className="h-4 w-4 text-emerald-600" /> Purchased Courses</h3>{selectedStudent.courses.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No courses purchased yet.</p> : <div className="space-y-2">{selectedStudent.courses.map((enrollment) => <div key={enrollment.id} className="rounded-lg border border-slate-200 p-3"><p className="font-medium text-slate-800">{enrollment.courses?.title || 'Course'}</p><p className="mt-1 text-xs text-slate-500">{enrollment.courses?.category || 'General'} · Joined {new Date(enrollment.created_at).toLocaleDateString()}</p><Badge className="mt-2 bg-emerald-100 text-emerald-700">{enrollment.status}</Badge></div>)}</div>}</div><div><h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><ClipboardCheck className="h-4 w-4 text-amber-600" /> Purchased Mock Tests</h3>{selectedStudent.mockTests.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No mock-test series purchased yet.</p> : <div className="space-y-2">{selectedStudent.mockTests.map((purchase) => <div key={purchase.id} className="rounded-lg border border-slate-200 p-3"><p className="font-medium text-slate-800">{purchase.mock_test_series?.title || 'Mock test series'}</p><p className="mt-1 text-xs text-slate-500">{purchase.mock_test_series?.exam_name || 'General'} · Paid ₹{purchase.amount_paid}</p><Badge className={`mt-2 ${purchase.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{purchase.status} · expires {new Date(purchase.expires_at).toLocaleDateString()}</Badge></div>)}</div>}</div></div>}
          </div>}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
