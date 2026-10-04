'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserRound, Phone, MapPin, Mail, Save, BookOpen, ClipboardCheck } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'student')) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'student' && user) {
      Promise.all([
        supabase.from('enrollments').select('id, status, created_at, courses(title, category)').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('mock_test_series_purchases').select('id, status, amount_paid, purchased_at, expires_at, mock_test_series(title, exam_name)').eq('student_id', user.id).order('purchased_at', { ascending: false }),
      ]).then(([enrollmentResult, purchaseResult]) => {
        setCourses(enrollmentResult.data || []);
        setPurchases(purchaseResult.data || []);
        setDataLoading(false);
      });
    }
  }, [profile, user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ phone: phone.trim(), address: address.trim() }).eq('id', user.id);
    if (error) toast.error('Could not save your profile.');
    else { await refreshProfile(); toast.success('Profile updated.'); }
    setSaving(false);
  };

  if (loading || !profile) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>;

  return (
    <DashboardShell role="student">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Account</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-slate-500">Keep your contact details up to date and review your purchases.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact card + edit form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="profile-address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Your city and full address" className="pl-10" />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="bg-sky-500 text-white hover:bg-sky-600">
                  <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save details'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-emerald-600" /> My Courses</CardTitle></CardHeader>
              <CardContent>
                {dataLoading ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div> : courses.length === 0 ? <p className="text-sm text-slate-500">No course enrollments yet.</p> : (
                  <div className="space-y-2">
                    {courses.map((enrollment) => (
                      <div key={enrollment.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm font-semibold text-slate-800">{enrollment.courses?.title || 'Course'}</p>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>{enrollment.courses?.category || 'General'}</span>
                          <Badge variant="outline">{enrollment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="h-4 w-4 text-amber-600" /> Mock Test Purchases</CardTitle></CardHeader>
              <CardContent>
                {dataLoading ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div> : purchases.length === 0 ? <p className="text-sm text-slate-500">No mock-test purchases yet.</p> : (
                  <div className="space-y-2">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm font-semibold text-slate-800">{purchase.mock_test_series?.title || 'Mock test series'}</p>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>{purchase.mock_test_series?.exam_name || 'General'} · ₹{purchase.amount_paid}</span>
                          <Badge className={purchase.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>{purchase.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary sidebar */}
        <Card className="h-fit border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100">
              <UserRound className="h-8 w-8 text-sky-600" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{profile.full_name}</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-slate-400" /><span className="break-all">{profile.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-slate-400" />{phone || 'Not added'}</div>
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span>{address || 'Not added'}</span></div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div><p className="text-2xl font-bold text-slate-900">{courses.length}</p><p className="text-xs text-slate-500">Courses</p></div>
                <div><p className="text-2xl font-bold text-slate-900">{purchases.length}</p><p className="text-xs text-slate-500">Mock Tests</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
