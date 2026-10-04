'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  PlayCircle,
  Calendar,
  Clock,
  ArrowLeft,
  BookOpen,
  Video,
  UserRound,
  RefreshCw,
} from 'lucide-react';

import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';

const SIGNED_URL_SECONDS = 5 * 60;

type Recording = {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  teacher_id: string;
  start_time: string;
  duration_minutes: number | null;
  status: string;
  recording_url: string | null;
  recording_path: string | null;
  playback_url: string | null;
  playback_error?: string | null;
  course_title: string;
  teacher_name: string;
};

export default function StudentRecordedClassesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selected, setSelected] = useState<Recording | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'student')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setDataLoading(true);
      setErrorMessage('');

      // ------------------------------------------------------------
      // 1. Get the courses in which the student is enrolled
      // ------------------------------------------------------------
      const {
        data: enrollments,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);

      if (enrollmentError) {
        throw new Error(
          `Could not load your courses: ${enrollmentError.message}`
        );
      }

      const courseIds = Array.from(
        new Set(
          (enrollments ?? [])
            .map((item: { course_id: string | null }) => item.course_id)
            .filter((id): id is string => Boolean(id))
        )
      );

      if (courseIds.length === 0) {
        setRecordings([]);
        return;
      }

      // ------------------------------------------------------------
      // 2. Get completed classes for those courses
      // ------------------------------------------------------------
      const {
        data: classes,
        error: classesError,
      } = await supabase
        .from('live_classes')
        .select(`
          id,
          title,
          description,
          course_id,
          teacher_id,
          start_time,
          duration_minutes,
          status,
          recording_url,
          recording_path,
          courses (
            title
          )
        `)
        .in('course_id', courseIds)
        .eq('status', 'completed')
        .order('start_time', { ascending: false });

      if (classesError) {
        throw new Error(
          `Could not load recorded classes: ${classesError.message}`
        );
      }

      const recordedClasses = (classes ?? []).filter(
        (item: any) =>
          Boolean(item.recording_path || item.recording_url)
      );

      if (recordedClasses.length === 0) {
        setRecordings([]);
        return;
      }

      // ------------------------------------------------------------
      // 3. Get teacher names separately
      // ------------------------------------------------------------
      const teacherIds = Array.from(
        new Set(
          recordedClasses
            .map((item: any) => item.teacher_id)
            .filter(Boolean)
        )
      );

      const teacherMap = new Map<string, string>();

      if (teacherIds.length > 0) {
        const {
          data: teachers,
          error: teachersError,
        } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds);

        if (teachersError) {
          console.warn(
            'Could not load teacher names:',
            teachersError
          );
        } else {
          (teachers ?? []).forEach((teacher: any) => {
            teacherMap.set(
              teacher.id,
              teacher.full_name || 'Teacher'
            );
          });
        }
      }

      // ------------------------------------------------------------
      // 4. Create temporary signed URLs for private videos
      // ------------------------------------------------------------
      const recordingsWithUrls: Recording[] = await Promise.all(
        recordedClasses.map(async (recording: any) => {
          let playbackUrl: string | null =
            recording.recording_url || null;

          let playbackError: string | null = null;

          if (recording.recording_path) {
            const {
              data: signed,
              error: signedError,
            } = await supabase.storage
              .from('recorded-class-videos')
              .createSignedUrl(
                recording.recording_path,
                SIGNED_URL_SECONDS
              );

            if (signedError) {
              playbackError = signedError.message;

              console.error(
                '[Recorded Classes] Signed URL error:',
                {
                  recordingId: recording.id,
                  recordingPath: recording.recording_path,
                  error: signedError,
                }
              );
            }

            if (signed?.signedUrl) {
              playbackUrl = signed.signedUrl;
              playbackError = null;
            }
          }

          return {
            id: recording.id,
            title: recording.title || 'Recorded Class',
            description: recording.description || null,
            course_id: recording.course_id,
            teacher_id: recording.teacher_id,
            start_time: recording.start_time,
            duration_minutes: recording.duration_minutes,
            status: recording.status,
            recording_url: recording.recording_url || null,
            recording_path: recording.recording_path || null,
            playback_url: playbackUrl,
            playback_error: playbackError,
            course_title:
              recording.courses?.title || 'Course',
            teacher_name:
              teacherMap.get(recording.teacher_id) || 'Teacher',
          };
        })
      );

      // IMPORTANT:
      // Do not filter these by playback_url. If Storage RLS fails,
      // the recording should remain visible so the problem is obvious.
      setRecordings(recordingsWithUrls);
    } catch (error: any) {
      console.error('fetchData error:', error);

      setRecordings([]);
      setErrorMessage(
        error?.message || 'Could not load recorded classes'
      );
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (profile?.role === 'student' && user) {
      fetchData();
    }
  }, [profile?.role, user, fetchData]);

  // ------------------------------------------------------------
  // YouTube helper
  // ------------------------------------------------------------
  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes('youtube.com')) {
        const videoId = parsed.searchParams.get('v');

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (parsed.hostname.includes('youtu.be')) {
        const videoId = parsed.pathname
          .replace('/', '')
          .split('/')[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  // ------------------------------------------------------------
  // Selected recording
  // ------------------------------------------------------------
  const selectedSource =
    selected?.playback_url ||
    selected?.recording_url ||
    null;

  const selectedYouTubeEmbed = selectedSource
    ? getYouTubeEmbedUrl(selectedSource)
    : null;

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  // ------------------------------------------------------------
  // Detail / player view
  // ------------------------------------------------------------
  if (selected) {
    return (
      <DashboardShell role="student">
        <Button
          variant="ghost"
          onClick={() => setSelected(null)}
          className="mb-4 text-slate-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recordings
        </Button>

        <div className="mx-auto max-w-5xl">
          <div className="mb-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700">
                Recorded Class
              </Badge>

              <Badge
                variant="outline"
                className="text-slate-600"
              >
                {selected.course_title}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {selected.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {selected.course_title}
              </span>

              <span className="flex items-center gap-1">
                <UserRound className="h-4 w-4" />
                {selected.teacher_name}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(
                  selected.start_time
                ).toLocaleDateString()}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selected.duration_minutes || 0} minutes
              </span>
            </div>
          </div>

          {!selectedSource && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                Video is temporarily unavailable.
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Please refresh the page and try again.
              </p>

              {selected.playback_error && (
                <p className="mt-2 break-words text-xs text-amber-700">
                  {selected.playback_error}
                </p>
              )}
            </div>
          )}

          {/* VIDEO PLAYER */}
          {selectedYouTubeEmbed ? (
            <div
              className="overflow-hidden rounded-xl bg-black shadow-xl"
              style={{ aspectRatio: '16 / 9' }}
            >
              <iframe
                src={selectedYouTubeEmbed}
                title={selected.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : selectedSource ? (
            <div
              className="overflow-hidden rounded-xl bg-black shadow-xl"
              style={{ aspectRatio: '16 / 9' }}
              onContextMenu={(event) => event.preventDefault()}
            >
              <video
                src={selectedSource}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                playsInline
                preload="metadata"
                onContextMenu={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
                onKeyDown={(event) => {
                  if (
                    event.key.toLowerCase() === 's' &&
                    (event.ctrlKey || event.metaKey)
                  ) {
                    event.preventDefault();
                  }
                }}
                className="h-full w-full select-none"
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <Video className="mx-auto h-12 w-12 text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                Recording is not available.
              </p>
            </div>
          )}

          {selected.description && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-2 font-semibold text-slate-900">
                About this class
              </h3>

              <p className="text-sm leading-6 text-slate-600">
                {selected.description}
              </p>
            </div>
          )}

          {selectedSource && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selected.duration_minutes || 0} minutes
              </span>

              <span>
                {new Date(
                  selected.start_time
                ).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  // ------------------------------------------------------------
  // List view
  // ------------------------------------------------------------
  return (
    <DashboardShell role="student">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Recorded Classes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Watch recorded classes from your enrolled courses
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchData}
          disabled={dataLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {errorMessage}
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {recordings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <PlayCircle className="mx-auto h-12 w-12 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-700">
            No recorded classes available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Recorded classes will appear here when a teacher
            uploads a recording for one of your enrolled courses.
          </p>

          <Button
            variant="outline"
            onClick={fetchData}
            className="mt-5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-500">
            {recordings.length}{' '}
            recorded{' '}
            {recordings.length === 1 ? 'class' : 'classes'}{' '}
            available
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recordings.map((recording) => (
              <Card
                key={recording.id}
                className="group overflow-hidden border-slate-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* THUMBNAIL */}
                <div
                  className="relative flex aspect-video cursor-pointer items-center justify-center bg-slate-900"
                  onClick={() => setSelected(recording)}
                  onContextMenu={(event) =>
                    event.preventDefault()
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-transform group-hover:scale-110">
                    <PlayCircle className="h-10 w-10 text-white" />
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                      Recorded
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {recording.duration_minutes || 0} min
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="line-clamp-2 font-semibold text-slate-900">
                    {recording.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {recording.description ||
                      'Watch this recorded class.'}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {recording.course_title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRound className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {recording.teacher_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />

                      {new Date(
                        recording.start_time
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <Button
                    className="mt-5 w-full bg-emerald-500 text-white hover:bg-emerald-600"
                    onClick={() => setSelected(recording)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {recording.playback_url
                      ? 'Watch Recording'
                      : 'Open Recording'}
                  </Button>

                  {!recording.playback_url &&
                    recording.playback_error && (
                      <p className="mt-2 text-center text-xs text-amber-600">
                        Video URL unavailable. Please refresh.
                      </p>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
