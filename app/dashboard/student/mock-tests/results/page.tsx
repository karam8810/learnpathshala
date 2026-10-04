'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Award, TrendingUp, Trophy, Clock, ChevronRight } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

export default function StudentMockTestResultsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
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
    const { data: attemptData } = await supabase
      .from('mock_test_attempts')
      .select('*, mock_tests(title, exam_name, category)')
      .eq('student_id', user!.id)
      .order('submitted_at', { ascending: false });
    setAttempts(attemptData || []);

    // Get rankings: best percentage per student across all tests
    const { data: allAttempts } = await supabase
      .from('mock_test_attempts')
      .select('student_id, percentage, score, total_points, profiles!mock_test_attempts_student_id_fkey(full_name)')
      .order('percentage', { ascending: false });

    // Build ranking: best score per student
    const studentMap: Record<string, { name: string; bestPercent: number; totalScore: number; attempts: number }> = {};
    (allAttempts || []).forEach((a: any) => {
      const pct = Number(a.percentage);
      if (!studentMap[a.student_id]) {
        studentMap[a.student_id] = {
          name: a.profiles?.full_name || 'Unknown',
          bestPercent: pct,
          totalScore: a.score,
          attempts: 1,
        };
      } else {
        studentMap[a.student_id].bestPercent = Math.max(studentMap[a.student_id].bestPercent, pct);
        studentMap[a.student_id].totalScore += a.score;
        studentMap[a.student_id].attempts += 1;
      }
    });

    const ranked = Object.entries(studentMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.bestPercent - a.bestPercent || b.totalScore - a.totalScore)
      .slice(0, 20);

    setRankings(ranked);
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const myRank = rankings.findIndex(r => r.id === user?.id);
  const myBest = attempts.length > 0 ? Math.max(...attempts.map(a => Number(a.percentage))) : 0;
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length)
    : 0;

  return (
    <DashboardShell role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Performance & Rankings</h1>
        <p className="text-sm text-slate-500">Track your test results and see how you rank</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Tests Taken</p><p className="mt-1 text-3xl font-bold text-slate-900">{attempts.length}</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100"><TrendingUp className="h-5 w-5 text-sky-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Best Score</p><p className="mt-1 text-3xl font-bold text-slate-900">{myBest}%</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100"><Award className="h-5 w-5 text-amber-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Average</p><p className="mt-1 text-3xl font-bold text-slate-900">{avgScore}%</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Your Rank</p><p className="mt-1 text-3xl font-bold text-slate-900">{myRank >= 0 ? `#${myRank + 1}` : '-'}</p></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100"><Trophy className="h-5 w-5 text-violet-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My attempts */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-sky-500" /> Recent Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.length === 0 ? (
                <p className="text-sm text-slate-500">No attempts yet. Take a mock test to see your results here.</p>
              ) : (
                attempts.map((a) => {
                  const pct = Number(a.percentage);
                  const passed = pct >= 70;
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${passed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        <Award className={`h-5 w-5 ${passed ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">{a.mock_tests?.title || 'Test'}</div>
                        <div className="text-xs text-slate-500">
                          Attempt {a.attempt_number} - {new Date(a.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                        {pct}%
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-500" /> Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.length === 0 ? (
                <p className="text-sm text-slate-500">No rankings yet. Be the first to take a test!</p>
              ) : (
                rankings.map((r, i) => {
                  const isMe = r.id === user?.id;
                  const medal = i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500';
                  return (
                    <div key={r.id} className={`flex items-center gap-3 rounded-lg p-3 ${isMe ? 'bg-sky-50 ring-1 ring-sky-200' : 'border border-slate-100'}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${medal}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {r.name} {isMe && <span className="text-xs text-sky-600">(You)</span>}
                        </div>
                        <div className="text-xs text-slate-500">{r.attempts} attempt{r.attempts === 1 ? '' : 's'} - {r.totalScore} pts</div>
                      </div>
                      <Badge variant="outline" className={r.bestPercent >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                        {r.bestPercent}%
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
