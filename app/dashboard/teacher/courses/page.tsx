'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen, Plus, Trash2, Users, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-sky-100 text-sky-700',
  unpublished: 'bg-slate-200 text-slate-700',
};

export default function TeacherCoursesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'General', suggested_price: '0' });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'teacher')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  const fetchCourses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });
    setCourses(data || []);

    const counts: Record<string, number> = {};
    for (const c of data || []) {
      const { count } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('course_id', c.id);
      counts[c.id] = count || 0;
    }
    setEnrollmentCounts(counts);
    setDataLoading(false);
  };

  useEffect(() => {
    if (profile?.role === 'teacher') fetchCourses();
  }, [profile]);

  const openCreate = () => {
    setEditCourse(null);
    setFormData({ title: '', description: '', category: 'General', suggested_price: '0' });
    setDialogOpen(true);
  };

  const openEdit = (course: any) => {
    setEditCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      category: course.category,
      suggested_price: String(course.suggested_price || 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) { toast.error('Title is required'); return; }
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      suggested_price: Math.max(0, Number(formData.suggested_price)),
    };

    if (editCourse) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editCourse.id);
      if (error) { toast.error('Could not update course.'); return; }
      toast.success('Course updated');
    } else {
      const { error } = await supabase.from('courses').insert({
        ...payload,
        teacher_id: user!.id,
      });
      if (error) { toast.error('Could not create course.'); return; }
      toast.success('Course created as draft');
    }
    setDialogOpen(false);
    fetchCourses();
  };

  const submitForReview = async (course: any) => {
    const { error } = await supabase.rpc('submit_course_for_review', { p_course_id: course.id });
    if (error) { toast.error('Could not submit course for review.'); return; }
    toast.success('Course submitted for admin review');
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { toast.error('Could not delete course.'); return; }
    toast.success('Course deleted');
    fetchCourses();
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <DashboardShell role="teacher">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-500">Create courses, set a suggested price, and submit for admin review</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
          <Plus className="mr-2 h-4 w-4" /> New Course
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusStyles[c.admin_status]}>{c.admin_status.replace('_', ' ')}</Badge>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline">{c.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {enrollmentCounts[c.id] || 0} students
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                <span className="font-medium">Suggested price:</span> ₹{c.suggested_price || 0}
                {c.final_price > 0 && c.final_price !== c.suggested_price && (
                  <span className="ml-2 text-sky-600">Final: ₹{c.final_price}</span>
                )}
              </div>
              {c.admin_status === 'rejected' && c.rejection_reason && (
                <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">{c.rejection_reason}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                {(c.admin_status === 'draft' || c.admin_status === 'rejected') && (
                  <Button size="sm" onClick={() => submitForReview(c)} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Send className="mr-1 h-3.5 w-3.5" /> Submit for Review
                  </Button>
                )}
                {(c.admin_status === 'draft' || c.admin_status === 'rejected') && (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-slate-500">
            No courses yet. Create your first course!
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Introduction to Physics" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What will students learn?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Science, Math, etc." />
              </div>
              <div className="space-y-2">
                <Label>Suggested Price (₹)</Label>
                <Input type="number" min="0" value={formData.suggested_price} onChange={(e) => setFormData({ ...formData, suggested_price: e.target.value })} placeholder="0 for free" />
                <p className="text-xs text-slate-400">Admin will set the final price. 0 = free.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {editCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
