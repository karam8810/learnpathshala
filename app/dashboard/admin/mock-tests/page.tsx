'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

type MockTest = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  exam_name: string;
  category: string;
  is_free: boolean;
  price: number;
  attempt_limit: number;
  time_limit_minutes: number;
  created_by: string;
  assigned_teacher_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
  assigned_teacher?: { full_name: string } | null;
};

type Teacher = { id: string; full_name: string };
type Question = { id: string; question_order: number; question_text: string; options: string[]; explanation: string | null; solution_video_path: string | null; points: number };

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-sky-100 text-sky-700',
  unpublished: 'bg-slate-200 text-slate-700',
};

export default function AdminMockTestsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testForm, setTestForm] = useState({
    title: '', description: '', exam_name: 'General', category: 'General', assigned_teacher_id: '',
    is_free: true, price: '0', attempt_limit: '1', time_limit_minutes: '30',
  });
  const [questionForm, setQuestionForm] = useState({ question_text: '', options: ['', '', '', ''], correct_answer: '0', explanation: '', points: '1', solution_video: null as File | null });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) router.push('/login');
  }, [loading, profile, router, user]);

  const fetchTests = async () => {
    const { data } = await supabase
      .from('mock_tests')
      .select('*, profiles!mock_tests_created_by_fkey(full_name), assigned_teacher:profiles!mock_tests_assigned_teacher_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    setTests((data || []) as MockTest[]);
  };

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    Promise.all([
      fetchTests(),
      supabase.from('profiles').select('id, full_name').eq('role', 'teacher').order('full_name'),
    ]).then(([, teacherResult]) => {
      setTeachers((teacherResult.data || []) as Teacher[]);
    }).finally(() => setBusy(false));
  }, [profile]);

  const loadQuestions = async (test: MockTest) => {
    setSelectedTest(test);
    const { data } = await supabase
      .from('mock_test_questions')
      .select('id, question_order, question_text, options, explanation, solution_video_path, points')
      .eq('test_id', test.id)
      .order('question_order');
    setQuestions((data || []) as Question[]);
  };

  const filteredTests = useMemo(() => tests.filter((test) =>
    `${test.title} ${test.exam_name} ${test.category}`.toLowerCase().includes(search.toLowerCase())
  ), [search, tests]);

  const resetTestForm = () => setTestForm({ title: '', description: '', exam_name: 'General', category: 'General', assigned_teacher_id: '', is_free: true, price: '0', attempt_limit: '1', time_limit_minutes: '30' });

  const openEdit = (test: MockTest) => {
    setSelectedTest(test);
    setTestForm({
      title: test.title, description: test.description || '', exam_name: test.exam_name, category: test.category,
      assigned_teacher_id: test.assigned_teacher_id || '', is_free: test.is_free, price: String(test.price),
      attempt_limit: String(test.attempt_limit), time_limit_minutes: String(test.time_limit_minutes),
    });
    setTestDialogOpen(true);
  };

  const saveTest = async () => {
    if (!testForm.title.trim()) { toast.error('Add a test title first.'); return; }
    setBusy(true);
    const payload = {
      title: testForm.title.trim(), description: testForm.description.trim() || null, exam_name: testForm.exam_name.trim() || 'General', category: testForm.category.trim() || 'General',
      assigned_teacher_id: testForm.assigned_teacher_id || null, is_free: testForm.is_free, price: testForm.is_free ? 0 : Math.max(0, Number(testForm.price)),
      attempt_limit: Math.min(100, Math.max(1, Number(testForm.attempt_limit))), time_limit_minutes: Math.min(600, Math.max(1, Number(testForm.time_limit_minutes))),
    };
    const result = selectedTest
      ? await supabase.from('mock_tests').update(payload).eq('id', selectedTest.id)
      : await supabase.from('mock_tests').insert({ ...payload, created_by: user!.id, status: 'approved' });
    setBusy(false);
    if (result.error) { toast.error('Could not save this test.'); return; }
    toast.success(selectedTest ? 'Test updated.' : 'Test created.');
    setTestDialogOpen(false); resetTestForm(); setSelectedTest(null); fetchTests();
  };

  const updateStatus = async (test: MockTest, status: string, rejectionReason?: string) => {
    const payload: { status: string; rejection_reason?: string | null; published_at?: string | null } = { status };
    if (status === 'rejected') payload.rejection_reason = rejectionReason || 'Please revise this test and submit it again.';
    if (status === 'published') payload.published_at = new Date().toISOString();
    if (status === 'unpublished') payload.published_at = null;
    const { error } = await supabase.from('mock_tests').update(payload).eq('id', test.id);
    if (error) { toast.error('Could not update the test status.'); return; }
    toast.success(`Test ${status.replace('_', ' ')}.`); fetchTests();
    if (selectedTest?.id === test.id) setSelectedTest({ ...test, ...payload });
  };

  const deleteTest = async (test: MockTest) => {
    if (!window.confirm(`Delete ${test.title}?`)) return;
    const { error } = await supabase.from('mock_tests').delete().eq('id', test.id);
    if (error) { toast.error('Could not delete this test.'); return; }
    toast.success('Test deleted.'); setSelectedTest(null); fetchTests();
  };

  const addQuestion = async () => {
    if (!selectedTest || !questionForm.question_text.trim()) { toast.error('Add question text first.'); return; }
    const options = questionForm.options.map((option) => option.trim()).filter(Boolean);
    const correctAnswer = Number(questionForm.correct_answer);
    if (options.length < 2 || correctAnswer >= options.length) { toast.error('Add at least two options and choose a valid answer.'); return; }
    const nextOrder = questions.length ? Math.max(...questions.map((question) => question.question_order)) + 1 : 1;
    const { data: question, error } = await supabase.from('mock_test_questions').insert({
      test_id: selectedTest.id, question_order: nextOrder, question_text: questionForm.question_text.trim(), options, explanation: questionForm.explanation.trim() || null, points: Math.max(1, Number(questionForm.points)),
    }).select('id').maybeSingle();
    if (error || !question) { toast.error('Could not add this question.'); return; }
    const keyResult = await supabase.from('mock_test_answer_keys').insert({ question_id: question.id, correct_answer: correctAnswer });
    if (keyResult.error) { toast.error('Question was created but its answer key could not be saved.'); return; }
    if (questionForm.solution_video) {
      const file = questionForm.solution_video;
      const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const path = `${user!.id}/${question.id}/${crypto.randomUUID()}.${extension}`;
      const uploadResult = await supabase.storage.from('mock-solution-videos').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadResult.error) { toast.error('Question saved, but the solution video could not be uploaded.'); }
      else await supabase.from('mock_test_questions').update({ solution_video_path: path }).eq('id', question.id);
    }
    toast.success('Question added.'); setQuestionDialogOpen(false); setQuestionForm({ question_text: '', options: ['', '', '', ''], correct_answer: '0', explanation: '', points: '1', solution_video: null }); loadQuestions(selectedTest);
  };

  const deleteQuestion = async (question: Question) => {
    const { error } = await supabase.from('mock_test_questions').delete().eq('id', question.id);
    if (error) { toast.error('Could not delete this question.'); return; }
    toast.success('Question deleted.'); if (selectedTest) loadQuestions(selectedTest);
  };

  if (loading || (profile?.role === 'admin' && busy && tests.length === 0)) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>;

  return (
    <DashboardShell role="admin">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Administration</p><h1 className="text-2xl font-bold text-slate-900">Mock Test Control Center</h1><p className="text-sm text-slate-500">Approve, publish, configure, and monitor every test series.</p></div>
        <Button onClick={() => { setSelectedTest(null); resetTestForm(); setTestDialogOpen(true); }} className="bg-sky-500 text-white hover:bg-sky-600"><Plus className="mr-2 h-4 w-4" /> Create Test</Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['All tests', tests.length], ['Needs review', tests.filter((test) => test.status === 'pending_review').length], ['Published', tests.filter((test) => test.status === 'published').length], ['Teacher-created', tests.filter((test) => test.created_by !== user?.id).length]].map(([label, value]) => <Card key={String(label)} className="border-slate-200 shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-slate-900">{value}</p></CardContent></Card>)}
      </div>

      <div className="mb-4 relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Search tests, exams, categories..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {filteredTests.map((test) => <Card key={test.id} className={`border-slate-200 shadow-sm transition-all hover:shadow-md ${selectedTest?.id === test.id ? 'ring-2 ring-sky-200' : ''}`}><CardContent className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100"><ClipboardCheck className="h-5 w-5 text-sky-600" /></div><div className="min-w-0"><h3 className="font-semibold text-slate-900">{test.title}</h3><p className="mt-1 text-sm text-slate-500">{test.exam_name} · {test.category} · {test.time_limit_minutes} min · {test.attempt_limit} attempt{test.attempt_limit === 1 ? '' : 's'}</p><p className="mt-2 text-xs text-slate-400">Created by {test.profiles?.full_name || 'Admin'}{test.assigned_teacher?.full_name ? ` · Assigned to ${test.assigned_teacher.full_name}` : ''}</p></div></div><div className="flex items-center gap-2"><Badge className={statusStyles[test.status]}>{test.status.replace('_', ' ')}</Badge><Badge variant="outline">{test.is_free ? 'Free' : `₹${test.price}`}</Badge></div></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => loadQuestions(test)}><Eye className="mr-1 h-3.5 w-3.5" /> Questions</Button><Button size="sm" variant="outline" onClick={() => openEdit(test)}><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit</Button>{test.status === 'pending_review' && <><Button size="sm" onClick={() => updateStatus(test, 'approved')} className="bg-emerald-500 text-white hover:bg-emerald-600"><Check className="mr-1 h-3.5 w-3.5" /> Approve</Button><Button size="sm" variant="outline" onClick={() => updateStatus(test, 'rejected')} className="text-red-600"><X className="mr-1 h-3.5 w-3.5" /> Reject</Button></>}{test.status === 'approved' && <Button size="sm" onClick={() => updateStatus(test, 'published')} className="bg-sky-500 text-white hover:bg-sky-600"><Eye className="mr-1 h-3.5 w-3.5" /> Publish</Button>}{test.status === 'published' && <Button size="sm" variant="outline" onClick={() => updateStatus(test, 'unpublished')}><EyeOff className="mr-1 h-3.5 w-3.5" /> Unpublish</Button>}<Button size="sm" variant="ghost" onClick={() => deleteTest(test)} className="text-red-500 hover:text-red-600"><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</Button></div></CardContent></Card>)}
          {filteredTests.length === 0 && <Card className="border-dashed border-slate-300"><CardContent className="py-16 text-center text-sm text-slate-500">No mock tests found.</CardContent></Card>}
        </div>

        <Card className="h-fit border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-sky-500" /> Test management</CardTitle></CardHeader><CardContent>{selectedTest ? <div className="space-y-4"><div><h3 className="font-semibold text-slate-900">{selectedTest.title}</h3><p className="text-sm text-slate-500">{questions.length} question{questions.length === 1 ? '' : 's'} · admin editing mode</p></div><Button onClick={() => setQuestionDialogOpen(true)} className="w-full bg-sky-500 text-white hover:bg-sky-600"><Plus className="mr-2 h-4 w-4" /> Add Question</Button><div className="space-y-3">{questions.map((question) => <div key={question.id} className="rounded-lg border border-slate-200 p-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-slate-800">{question.question_order}. {question.question_text}</p><Button size="icon" variant="ghost" onClick={() => deleteQuestion(question)} className="h-7 w-7 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button></div><p className="mt-2 text-xs text-slate-500">{question.options.length} options · {question.points} point{question.points === 1 ? '' : 's'}</p></div>)}{questions.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No questions yet. Add questions before publishing.</p>}</div></div> : <div className="py-10 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Select a test to manage its questions and answer key.</p></div>}</CardContent></Card>
      </div>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{selectedTest ? 'Edit Mock Test' : 'Create Mock Test'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label>Test title</Label><Input value={testForm.title} onChange={(event) => setTestForm({ ...testForm, title: event.target.value })} placeholder="UGC NET Education Mock Test 01" /></div><div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea value={testForm.description} onChange={(event) => setTestForm({ ...testForm, description: event.target.value })} placeholder="What students will practice..." /></div><div className="space-y-2"><Label>Exam</Label><Input value={testForm.exam_name} onChange={(event) => setTestForm({ ...testForm, exam_name: event.target.value })} placeholder="Banking, CTET, UGC NET" /></div><div className="space-y-2"><Label>Category</Label><Input value={testForm.category} onChange={(event) => setTestForm({ ...testForm, category: event.target.value })} placeholder="Reasoning, Teaching" /></div><div className="space-y-2 sm:col-span-2"><Label>Assign teacher</Label><select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={testForm.assigned_teacher_id} onChange={(event) => setTestForm({ ...testForm, assigned_teacher_id: event.target.value })}><option value="">No teacher assigned</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}</select></div><div className="space-y-2"><Label>Time limit (minutes)</Label><Input type="number" min="1" value={testForm.time_limit_minutes} onChange={(event) => setTestForm({ ...testForm, time_limit_minutes: event.target.value })} /></div><div className="space-y-2"><Label>Attempt limit</Label><Input type="number" min="1" value={testForm.attempt_limit} onChange={(event) => setTestForm({ ...testForm, attempt_limit: event.target.value })} /></div><div className="flex items-center gap-3 sm:col-span-2"><input id="admin-free" type="checkbox" checked={testForm.is_free} onChange={(event) => setTestForm({ ...testForm, is_free: event.target.checked })} className="h-4 w-4 accent-sky-500" /><Label htmlFor="admin-free">Free test</Label></div>{!testForm.is_free && <div className="space-y-2 sm:col-span-2"><Label>Price</Label><Input type="number" min="0" step="0.01" value={testForm.price} onChange={(event) => setTestForm({ ...testForm, price: event.target.value })} /></div>}</div><DialogFooter><Button variant="outline" onClick={() => setTestDialogOpen(false)}>Cancel</Button><Button onClick={saveTest} disabled={busy} className="bg-sky-500 text-white hover:bg-sky-600">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save test</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Question</Label><Textarea value={questionForm.question_text} onChange={(event) => setQuestionForm({ ...questionForm, question_text: event.target.value })} placeholder="What is the correct answer?" /></div><div className="space-y-2"><Label>Options — select the correct answer</Label>{questionForm.options.map((option, index) => <div key={index} className="flex items-center gap-2"><input type="radio" name="admin-correct" checked={questionForm.correct_answer === String(index)} onChange={() => setQuestionForm({ ...questionForm, correct_answer: String(index) })} className="h-4 w-4 accent-sky-500" /><Input value={option} onChange={(event) => { const options = [...questionForm.options]; options[index] = event.target.value; setQuestionForm({ ...questionForm, options }); }} placeholder={`Option ${index + 1}`} /></div>)}</div><div className="space-y-2"><Label>Explanation</Label><Textarea value={questionForm.explanation} onChange={(event) => setQuestionForm({ ...questionForm, explanation: event.target.value })} placeholder="Explain why the answer is correct..." /></div><div className="space-y-2"><Label>Video solution <span className="font-normal text-slate-400">(optional)</span></Label><div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-3"><Upload className="h-4 w-4 text-slate-400" /><Input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={(event) => setQuestionForm({ ...questionForm, solution_video: event.target.files?.[0] || null })} className="border-0 p-0 shadow-none" /></div>{questionForm.solution_video && <p className="text-xs text-slate-500">{questionForm.solution_video.name}</p>}<p className="text-xs text-slate-500">MP4, WebM, MOV, or AVI up to 100 MB.</p></div><div className="space-y-2"><Label>Points</Label><Input type="number" min="1" value={questionForm.points} onChange={(event) => setQuestionForm({ ...questionForm, points: event.target.value })} /></div></div><DialogFooter><Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>Cancel</Button><Button onClick={addQuestion} className="bg-sky-500 text-white hover:bg-sky-600">Add question</Button></DialogFooter></DialogContent></Dialog>
    </DashboardShell>
  );
}
