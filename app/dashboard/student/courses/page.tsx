'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen, Search, CheckCircle2, IndianRupee, Tag, Sparkles } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function StudentCoursesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! You are now enrolled.');
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed or was cancelled. Please try again.');
    }
    if (paymentStatus) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchData = async () => {
    const { data: courses } = await supabase
      .from('courses')
      .select('*, profiles!courses_teacher_id_fkey(full_name)')
      .eq('admin_status', 'published')
      .order('created_at', { ascending: false });

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user!.id);

    setAllCourses(courses || []);
    setEnrolledIds(new Set((enrollments || []).map(e => e.course_id)));
    setDataLoading(false);
  };

  const getEffectivePrice = (course: any) => {
    if (course.discount_active && course.discount_price > 0 &&
        (!course.discount_expires_at || new Date(course.discount_expires_at) > new Date())) {
      return Math.min(course.final_price || 0, course.discount_price);
    }
    return course.final_price || 0;
  };

  const hasDiscount = (course: any) => {
    return course.discount_active && course.discount_price > 0 &&
      course.discount_price < (course.final_price || 0) &&
      (!course.discount_expires_at || new Date(course.discount_expires_at) > new Date());
  };

  const handleEnroll = async (course: any) => {
    setEnrolling(course.id);
    const price = getEffectivePrice(course);

    if (price > 0) {
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/functions/v1/payu-create-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course.id }),
        });
        if (!res.ok) {
          toast.error('Could not start payment. Please try again.');
          setEnrolling(null);
          return;
        }
        const payData = await res.json();
        if (payData.error) {
          toast.error(payData.error);
          setEnrolling(null);
          return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payData.payu_url;
        form.style.display = 'none';

        const fields: Record<string, string> = {
          key: payData.key,
          txnid: payData.txnid,
          amount: String(payData.amount),
          productinfo: payData.productinfo,
          firstname: payData.firstname,
          email: payData.email,
          phone: '',
          surl: payData.surl,
          curl: payData.curl,
          hash: payData.hash,
          udf1: '',
          udf2: '',
          udf3: '',
          udf4: '',
          udf5: '',
          udf6: '',
          udf7: '',
          udf8: '',
          udf9: '',
          udf10: '',
        };

        for (const [name, value] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        return;
      } catch {
        toast.error('Could not connect to payment gateway.');
        setEnrolling(null);
        return;
      }
    }

    const { data, error } = await supabase.rpc('enroll_in_course', { p_course_id: course.id });

    if (error) {
      if (error.message.includes('Already enrolled')) {
        toast.error('Already enrolled in this course');
      } else {
        toast.error('Could not enroll in this course.');
      }
      setEnrolling(null);
      return;
    }

    toast.success('Enrolled successfully!');
    setEnrolledIds((previous) => new Set(previous).add(course.id));
    setEnrolling(null);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const tabCourses = activeTab === 'my'
    ? allCourses.filter((course) => enrolledIds.has(course.id))
    : allCourses;
  const filtered = tabCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell role="student">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{activeTab === 'my' ? 'My Courses' : 'All Courses'}</h1>
          <p className="text-sm text-slate-500">{activeTab === 'my' ? 'Continue learning in the courses you enrolled in' : 'Explore all published courses available to you'}</p>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as 'my' | 'all'); setSearch(''); }}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="my">My Courses <span className="ml-1.5 rounded-full bg-white px-1.5 text-xs text-slate-500">{enrolledIds.size}</span></TabsTrigger>
            <TabsTrigger value="all">All Courses <span className="ml-1.5 rounded-full bg-white px-1.5 text-xs text-slate-500">{allCourses.length}</span></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const isEnrolled = enrolledIds.has(c.id);
          const price = getEffectivePrice(c);
          const discounted = hasDiscount(c);

          return (
            <Card key={c.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    {discounted && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <Tag className="mr-1 h-3 w-3" /> Sale
                      </Badge>
                    )}
                    {isEnrolled && (
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Enrolled
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline">{c.category}</Badge>
                  <span className="text-xs text-slate-500">{c.profiles?.full_name || 'Unknown'}</span>
                </div>

                {/* Price section */}
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  {price === 0 ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">Free Course</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {discounted && (
                        <span className="text-sm text-slate-400 line-through">₹{c.final_price}</span>
                      )}
                      <span className="flex items-center text-lg font-bold text-slate-900">
                        <IndianRupee className="h-4 w-4" />{price}
                      </span>
                      {discounted && (
                        <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-700">
                          Save ₹{(c.final_price - price).toFixed(0)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {isEnrolled ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Enrolled
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEnroll(c)}
                      disabled={enrolling === c.id}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {enrolling === c.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
                      ) : price > 0 ? (
                        <><IndianRupee className="mr-2 h-4 w-4" /> Enroll for ₹{price}</>
                      ) : (
                        <>Enroll for Free</>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{activeTab === 'my' ? 'You have not enrolled in any courses yet.' : 'No published courses found.'}</p>
            {activeTab === 'my' && <Button variant="outline" className="mt-4" onClick={() => setActiveTab('all')}>Browse All Courses</Button>}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
