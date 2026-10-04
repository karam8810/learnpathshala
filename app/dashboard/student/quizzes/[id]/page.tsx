'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Brain, Clock, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Award,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function QuizTakePage({ params }: { params: { id: string } }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'student')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (profile?.role === 'student' && user) {
      fetchQuiz();
    }
  }, [profile, user]);

  useEffect(() => {
    if (timeLeft > 0 && !result && !submitting) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, result, submitting]);

  const fetchQuiz = async () => {
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*, courses(title)')
      .eq('id', params.id)
      .maybeSingle();

    if (!quizData) {
      toast.error('Quiz not found');
      router.push('/dashboard/student/quizzes');
      return;
    }

    const { data: questionData } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', params.id)
      .order('created_at', { ascending: true });

    setQuiz(quizData);
    setQuestions(questionData || []);
    setTimeLeft(quizData.time_limit_minutes * 60);
    setDataLoading(false);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    let score = 0;
    let total = 0;
    const answerRecords: any[] = [];

    questions.forEach((q) => {
      total += q.points;
      const selected = answers[q.id];
      const isCorrect = selected !== undefined && selected === q.correct_answer;
      if (isCorrect) score += q.points;
      answerRecords.push({
        question_id: q.id,
        selected_answer: selected ?? -1,
        is_correct: isCorrect,
      });
    });

    const { data: submission, error } = await supabase.from('submissions').insert({
      quiz_id: params.id,
      student_id: user!.id,
      score,
      total_points: total,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    if (answerRecords.length > 0 && submission) {
      const insertData = answerRecords.map(a => ({ ...a, submission_id: submission.id }));
      await supabase.from('answers').insert(insertData);
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    setResult({ score, total, percentage });
    setSubmitting(false);
    toast.success('Quiz submitted!');
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (result) {
    const passed = result.percentage >= 70;
    return (
      <DashboardShell role="student">
        <div className="mx-auto max-w-2xl">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${passed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <Award className={`h-10 w-10 ${passed ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {passed ? 'Congratulations!' : 'Keep practicing!'}
              </h1>
              <p className="mt-2 text-slate-500">{quiz?.title}</p>

              <div className="mt-6 rounded-xl bg-slate-50 p-6">
                <div className="text-4xl font-bold text-slate-900">{result.percentage}%</div>
                <div className="mt-1 text-sm text-slate-500">
                  You scored {result.score} out of {result.total} points
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50 p-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-2xl font-bold">{result.score}</span>
                  </div>
                  <div className="text-xs text-emerald-600">Correct</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-center justify-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <span className="text-2xl font-bold">{result.total - result.score}</span>
                  </div>
                  <div className="text-xs text-red-600">Incorrect</div>
                </div>
              </div>

              <Link href="/dashboard/student/quizzes" className="mt-8 block">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  Back to Quizzes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (questions.length === 0) {
    return (
      <DashboardShell role="student">
        <div className="py-16 text-center">
          <Brain className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">This quiz has no questions yet.</p>
          <Link href="/dashboard/student/quizzes" className="mt-4 inline-block">
            <Button variant="outline">Back to Quizzes</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeWarning = timeLeft < 60;

  return (
    <DashboardShell role="student">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard/student/quizzes" className="mb-4 inline-block">
          <Button variant="ghost" className="text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{quiz?.title}</h1>
            <p className="text-sm text-slate-500">{quiz?.courses?.title}</p>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${timeWarning ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg font-bold">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-slate-500">{answeredCount} answered</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{currentQ.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((opt: string, i: number) => {
              const isSelected = answers[currentQ.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: i })}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question dots */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-white'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
