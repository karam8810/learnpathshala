'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Brain, Plus, Trash2, ChevronRight, ArrowLeft, Save, X,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function TeacherQuizzesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '', course_id: '', time_limit_minutes: 30 });
  const [questionForm, setQuestionForm] = useState({ question_text: '', options: ['', '', '', ''], correct_answer: 0 });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'teacher')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  const fetchQuizzes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quizzes')
      .select('*, courses(title)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });
    setQuizzes(data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (profile?.role === 'teacher' && user) {
      fetchQuizzes();
      supabase.from('courses').select('id, title').eq('teacher_id', user.id)
        .then(({ data }) => setCourses(data || []));
    }
  }, [profile, user]);

  const handleCreate = async () => {
    if (!formData.title || !formData.course_id) {
      toast.error('Title and course are required');
      return;
    }
    const { error } = await supabase.from('quizzes').insert({
      title: formData.title,
      description: formData.description,
      course_id: formData.course_id,
      teacher_id: user!.id,
      time_limit_minutes: Number(formData.time_limit_minutes),
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Quiz created');
    setDialogOpen(false);
    setFormData({ title: '', description: '', course_id: '', time_limit_minutes: 30 });
    fetchQuizzes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Quiz deleted');
    fetchQuizzes();
  };

  const openQuiz = async (quiz: any) => {
    setSelectedQuiz(quiz);
    const { data } = await supabase.from('questions').select('*').eq('quiz_id', quiz.id).order('created_at', { ascending: true });
    setQuestions(data || []);
  };

  const addQuestion = async () => {
    if (!questionForm.question_text || !selectedQuiz) return;
    const options = questionForm.options.filter(o => o.trim() !== '');
    if (options.length < 2) { toast.error('Need at least 2 options'); return; }
    const { error } = await supabase.from('questions').insert({
      quiz_id: selectedQuiz.id,
      question_text: questionForm.question_text,
      options: options,
      correct_answer: questionForm.correct_answer,
      points: 1,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Question added');
    setQuestionForm({ question_text: '', options: ['', '', '', ''], correct_answer: 0 });
    const { data } = await supabase.from('questions').select('*').eq('quiz_id', selectedQuiz.id).order('created_at', { ascending: true });
    setQuestions(data || []);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setQuestions(questions.filter(q => q.id !== id));
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  // Quiz detail view
  if (selectedQuiz) {
    return (
      <DashboardShell role="teacher">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setSelectedQuiz(null)} className="mb-2 text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{selectedQuiz.title}</h1>
          <p className="text-sm text-slate-500">{selectedQuiz.courses?.title} - {selectedQuiz.time_limit_minutes} min time limit</p>
        </div>

        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                placeholder="What is 2 + 2?"
              />
            </div>
            <div className="space-y-2">
              <Label>Options (select the correct answer)</Label>
              {questionForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={questionForm.correct_answer === i}
                    onChange={() => setQuestionForm({ ...questionForm, correct_answer: i })}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[i] = e.target.value;
                      setQuestionForm({ ...questionForm, options: newOptions });
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            <Button onClick={addQuestion} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Questions ({questions.length})</h3>
          {questions.map((q, i) => (
            <Card key={q.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-900">{q.question_text}</span>
                    </div>
                    <div className="mt-3 ml-8 space-y-1">
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} className={`flex items-center gap-2 text-sm ${j === q.correct_answer ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300">
                            {j === q.correct_answer && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteQuestion(q.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {questions.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No questions yet. Add your first question above.</p>
          )}
        </div>
      </DashboardShell>
    );
  }

  // Quiz list view
  return (
    <DashboardShell role="teacher">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-sm text-slate-500">Create quizzes and manage questions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
              <Plus className="mr-2 h-4 w-4" /> New Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Quiz</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quiz Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Chapter 5 Quiz" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What does this quiz cover?" />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}>
                  <option value="">Select a course...</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input type="number" value={formData.time_limit_minutes} onChange={(e) => setFormData({ ...formData, time_limit_minutes: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white">Create Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q) => (
          <Card key={q.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md cursor-pointer" >
            <CardContent className="p-5" onClick={() => openQuiz(q)}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                  <Brain className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{q.time_limit_minutes} min</Badge>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900">{q.title}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{q.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{q.courses?.title}</span>
                <span className="flex items-center gap-1 text-sky-600 font-medium">
                  Manage questions <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-slate-500">
            No quizzes yet. Create your first quiz!
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
