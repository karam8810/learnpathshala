'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Video,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Link2,
  Play,
  PlayCircle,
  Upload,
} from 'lucide-react';

import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

type UploadMode = 'existing' | 'new';

export default function TeacherLiveClassesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  // End live class dialog
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endingClassId, setEndingClassId] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [recordingFile, setRecordingFile] = useState<File | null>(null);

  // Direct recording upload dialog
  const [recordingDialogOpen, setRecordingDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>('existing');
  const [recordingClassId, setRecordingClassId] = useState<string | null>(null);
  const [directRecordingTitle, setDirectRecordingTitle] = useState('');
  const [directRecordingDescription, setDirectRecordingDescription] = useState('');
  const [directRecordingCourseId, setDirectRecordingCourseId] = useState('');
  const [directRecordingStartTime, setDirectRecordingStartTime] = useState('');
  const [directRecordingFile, setDirectRecordingFile] = useState<File | null>(null);
  const [uploadingRecording, setUploadingRecording] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    start_time: '',
    duration_minutes: 60,
    meeting_link: '',
  });

  // ============================================================
  // AUTH
  // ============================================================

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'teacher')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  // ============================================================
  // FETCH CLASSES
  // ============================================================

  const fetchClasses = async () => {
    if (!user) return;

    setDataLoading(true);

    const { data, error } = await supabase
      .from('live_classes')
      .select(`
        *,
        courses(title)
      `)
      .eq('teacher_id', user.id)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('fetchClasses:', error);
      toast.error('Could not load live classes');
      setClasses([]);
    } else {
      setClasses(data || []);
    }

    setDataLoading(false);
  };

  // ============================================================
  // FETCH TEACHER COURSES
  // ============================================================

  const fetchCourses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('courses')
      .select('id, title, teacher_id')
      .eq('teacher_id', user.id)
      .order('title');

    if (error) {
      console.error('fetchCourses:', error);
      toast.error('Could not load your courses');
      return;
    }

    setCourses(data || []);
  };

  useEffect(() => {
    if (profile?.role === 'teacher' && user) {
      fetchClasses();
      fetchCourses();
    }
  }, [profile, user]);

  // ============================================================
  // CREATE LIVE CLASS
  // ============================================================

  const handleCreate = async () => {
    if (
      !formData.title.trim() ||
      !formData.course_id ||
      !formData.start_time
    ) {
      toast.error('Title, course, and start time are required');
      return;
    }

    if (!user) {
      toast.error('You are not logged in');
      return;
    }

    const selectedCourse = courses.find(
      (course) => course.id === formData.course_id
    );

    if (!selectedCourse) {
      toast.error('Selected course not found');
      return;
    }

    const { error } = await supabase.from('live_classes').insert({
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      course_id: formData.course_id,
      teacher_id: user.id,
      start_time: new Date(formData.start_time).toISOString(),
      duration_minutes: Number(formData.duration_minutes) || 60,
      meeting_link: formData.meeting_link.trim() || null,
      status: 'scheduled',
    });

    if (error) {
      console.error('handleCreate:', error);
      toast.error(error.message);
      return;
    }

    toast.success('Live class scheduled');

    setDialogOpen(false);

    setFormData({
      title: '',
      description: '',
      course_id: '',
      start_time: '',
      duration_minutes: 60,
      meeting_link: '',
    });

    await fetchClasses();
  };

  // ============================================================
  // DELETE CLASS
  // ============================================================

  const handleDelete = async (id: string) => {
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('recording_path')
      .eq('id', id)
      .eq('teacher_id', user?.id)
      .single();

    if (liveClass?.recording_path) {
      await supabase.storage
        .from('recorded-class-videos')
        .remove([liveClass.recording_path]);
    }

    const { error } = await supabase
      .from('live_classes')
      .delete()
      .eq('id', id)
      .eq('teacher_id', user?.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Live class deleted');
    await fetchClasses();
  };

  // ============================================================
  // START LIVE
  // ============================================================

  const handleStartLive = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('live_classes')
      .update({ status: 'live' })
      .eq('id', id)
      .eq('teacher_id', user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Class is now live!');
    await fetchClasses();
  };

  // ============================================================
  // END LIVE DIALOG
  // ============================================================

  const openEndDialog = (id: string) => {
    setEndingClassId(id);
    setRecordingUrl('');
    setRecordingFile(null);
    setEndDialogOpen(true);
  };

  // ============================================================
  // END LIVE + OPTIONAL RECORDING
  // ============================================================

  const handleEndLive = async () => {
    if (!endingClassId || !user) return;

    if (
      recordingFile &&
      !ALLOWED_VIDEO_TYPES.includes(recordingFile.type)
    ) {
      toast.error(
        'Only MP4, WebM, MOV, AVI or MKV videos are allowed'
      );
      return;
    }

    if (
      recordingFile &&
      recordingFile.size > MAX_FILE_SIZE
    ) {
      toast.error('Video must be smaller than 500 MB');
      return;
    }

    let uploadedPath: string | null = null;

    try {
      setUploadingRecording(true);

      // Mark class completed first.
      const { error: endError } = await supabase
        .from('live_classes')
        .update({
          status: 'completed',
          recording_url: recordingUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', endingClassId)
        .eq('teacher_id', user.id);

      if (endError) {
        throw endError;
      }

      // Upload local recording if supplied.
      if (recordingFile) {
        const extension =
          recordingFile.name.split('.').pop()?.toLowerCase() || 'mp4';

        uploadedPath =
          `${user.id}/${endingClassId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('recorded-class-videos')
          .upload(uploadedPath, recordingFile, {
            cacheControl: '3600',
            contentType: recordingFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { error: pathError } = await supabase
          .from('live_classes')
          .update({
            recording_path: uploadedPath,
          })
          .eq('id', endingClassId)
          .eq('teacher_id', user.id);

        if (pathError) {
          await supabase.storage
            .from('recorded-class-videos')
            .remove([uploadedPath]);

          throw pathError;
        }
      }

      toast.success(
        'Class ended' +
          (recordingUrl || recordingFile
            ? ' - recording saved'
            : '')
      );

      setEndDialogOpen(false);
      setEndingClassId(null);
      setRecordingUrl('');
      setRecordingFile(null);

      await fetchClasses();
    } catch (error: any) {
      console.error('handleEndLive:', error);

      // If video upload failed, keep class completed but tell teacher.
      if (uploadedPath) {
        await supabase.storage
          .from('recorded-class-videos')
          .remove([uploadedPath]);
      }

      toast.error(
        error?.message ||
          'Could not complete this class'
      );
    } finally {
      setUploadingRecording(false);
    }
  };

  // ============================================================
  // DIRECT RECORDING DIALOG
  //
  // Existing class:
  // upload recording to a class already scheduled.
  //
  // New recorded class:
  // no scheduling required. Teacher selects one of their courses
  // and the system creates a completed live_classes row.
  // ============================================================

  const openRecordingDialog = (id?: string) => {
    setRecordingClassId(id || null);
    setDirectRecordingFile(null);
    setDirectRecordingTitle('');
    setDirectRecordingDescription('');
    setDirectRecordingCourseId('');
    setDirectRecordingStartTime('');

    if (id) {
      setUploadMode('existing');
    } else {
      setUploadMode(classes.length > 0 ? 'existing' : 'new');
    }

    setRecordingDialogOpen(true);
  };

  const resetRecordingDialog = () => {
    setRecordingClassId(null);
    setDirectRecordingFile(null);
    setDirectRecordingTitle('');
    setDirectRecordingDescription('');
    setDirectRecordingCourseId('');
    setDirectRecordingStartTime('');
    setUploadMode('existing');
  };

  // ============================================================
  // DIRECT RECORDING UPLOAD
  // ============================================================

  const handleUploadRecording = async () => {
    if (!user) {
      toast.error('You are not logged in');
      return;
    }

    if (!directRecordingFile) {
      toast.error('Choose a video first');
      return;
    }

    if (
      !ALLOWED_VIDEO_TYPES.includes(
        directRecordingFile.type
      )
    ) {
      toast.error(
        'Only MP4, WebM, MOV, AVI or MKV videos are allowed'
      );
      return;
    }

    if (directRecordingFile.size > MAX_FILE_SIZE) {
      toast.error('Video must be smaller than 500 MB');
      return;
    }

    if (
      uploadMode === 'existing' &&
      !recordingClassId
    ) {
      toast.error('Please select a class');
      return;
    }

    if (uploadMode === 'new') {
      if (!directRecordingTitle.trim()) {
        toast.error('Please enter the class title');
        return;
      }

      if (!directRecordingCourseId) {
        toast.error('Please select a course');
        return;
      }
    }

    let classId: string | null = recordingClassId;
    let createdClassId: string | null = null;
    let oldRecordingPath: string | null = null;
    let uploadedPath: string | null = null;

    try {
      setUploadingRecording(true);

      // ========================================================
      // EXISTING CLASS
      // ========================================================

      if (uploadMode === 'existing') {
        const { data: liveClass, error: classError } =
          await supabase
            .from('live_classes')
            .select('id, recording_path')
            .eq('id', recordingClassId!)
            .eq('teacher_id', user.id)
            .single();

        if (classError || !liveClass) {
          throw new Error(
            'Live class not found or you do not have access to it'
          );
        }

        classId = liveClass.id;
        oldRecordingPath =
          liveClass.recording_path || null;
      }

      // ========================================================
      // NEW RECORDED CLASS
      // ========================================================

      if (uploadMode === 'new') {
        const course = courses.find(
          (item) => item.id === directRecordingCourseId
        );

        if (!course) {
          throw new Error('Selected course not found');
        }

        // Teacher can only use courses loaded by teacher_id = user.id.
        if (course.teacher_id !== user.id) {
          throw new Error(
            'You can only upload recordings for your own courses'
          );
        }

        const { data: newClass, error: createError } =
          await supabase
            .from('live_classes')
            .insert({
              title: directRecordingTitle.trim(),
              description:
                directRecordingDescription.trim() || null,
              course_id: course.id,
              teacher_id: user.id,
              start_time: directRecordingStartTime
                ? new Date(
                    directRecordingStartTime
                  ).toISOString()
                : new Date().toISOString(),
              duration_minutes: 60,
              meeting_link: null,
              status: 'completed',
              recording_url: null,
              recording_path: null,
            })
            .select('id')
            .single();

        if (createError || !newClass) {
          console.error(
            'create recorded class:',
            createError
          );

          throw new Error(
            createError?.message ||
              'Could not create recorded class'
          );
        }

        classId = newClass.id;
        createdClassId = newClass.id;
      }

      if (!classId) {
        throw new Error('Class ID is missing');
      }

      // ========================================================
      // DELETE OLD RECORDING
      // ========================================================

      if (oldRecordingPath) {
        const { error: deleteError } =
          await supabase.storage
            .from('recorded-class-videos')
            .remove([oldRecordingPath]);

        if (deleteError) {
          console.warn(
            'Could not remove old recording:',
            deleteError
          );
        }
      }

      // ========================================================
      // STORAGE PATH
      // ========================================================

      const extension =
        directRecordingFile.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'mp4';

      uploadedPath =
        `${user.id}/${classId}/${crypto.randomUUID()}.${extension}`;

      // ========================================================
      // UPLOAD
      // ========================================================

      const { error: uploadError } =
        await supabase.storage
          .from('recorded-class-videos')
          .upload(
            uploadedPath,
            directRecordingFile,
            {
              cacheControl: '3600',
              contentType:
                directRecordingFile.type,
              upsert: false,
            }
          );

      if (uploadError) {
        if (createdClassId) {
          await supabase
            .from('live_classes')
            .delete()
            .eq('id', createdClassId)
            .eq('teacher_id', user.id);
        }

        throw uploadError;
      }

      // ========================================================
      // SAVE PATH
      // ========================================================

      const { error: updateError } =
        await supabase
          .from('live_classes')
          .update({
            recording_path: uploadedPath,
            recording_url: null,
            status: 'completed',
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', classId)
          .eq('teacher_id', user.id);

      if (updateError) {
        await supabase.storage
          .from('recorded-class-videos')
          .remove([uploadedPath]);

        if (createdClassId) {
          await supabase
            .from('live_classes')
            .delete()
            .eq('id', createdClassId)
            .eq('teacher_id', user.id);
        }

        throw updateError;
      }

      toast.success(
        uploadMode === 'new'
          ? 'Recorded class created and uploaded successfully'
          : 'Recording uploaded successfully'
      );

      setRecordingDialogOpen(false);
      resetRecordingDialog();

      await fetchClasses();
    } catch (error: any) {
      console.error(
        'Recording upload failed:',
        error
      );

      toast.error(
        error?.message ||
          'Could not upload recording'
      );
    } finally {
      setUploadingRecording(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  // ============================================================
  // STATUS COLORS
  // ============================================================

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    live: 'bg-red-100 text-red-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-amber-100 text-amber-700',
  };

  return (
    <DashboardShell role="teacher">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Live Classes
          </h1>

          <p className="text-sm text-slate-500">
            Schedule, manage and upload your class recordings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* UPLOAD RECORDING */}
          <Button
            variant="outline"
            onClick={() => openRecordingDialog()}
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Recording
          </Button>

          {/* SCHEDULE CLASS */}
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 text-white shadow-md hover:bg-emerald-600">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Class
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Schedule New Live Class
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Class Title</Label>

                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    placeholder="Algebra Chapter 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>

                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="What will be covered?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course</Label>

                  <select
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    value={formData.course_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course_id: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select a course...
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>

                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>

                    <Input
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_minutes:
                            Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Meeting Link</Label>

                  <Input
                    value={formData.meeting_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meeting_link: e.target.value,
                      })
                    }
                    placeholder="https://meet.example.com/..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setDialogOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreate}
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ======================================================
          DIRECT RECORDING DIALOG
      ======================================================= */}

      <Dialog
        open={recordingDialogOpen}
        onOpenChange={(open) => {
          if (uploadingRecording) return;

          setRecordingDialogOpen(open);

          if (!open) {
            resetRecordingDialog();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Upload Class Recording
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* MODE SWITCH */}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                disabled={classes.length === 0}
                onClick={() => {
                  setUploadMode('existing');
                  setRecordingClassId(null);
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  uploadMode === 'existing'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600'
                } ${
                  classes.length === 0
                    ? 'cursor-not-allowed opacity-40'
                    : ''
                }`}
              >
                Existing Class
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadMode('new');
                  setRecordingClassId(null);
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  uploadMode === 'new'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                New Recorded Class
              </button>
            </div>

            {/* ==================================================
                EXISTING CLASS
            =================================================== */}

            {uploadMode === 'existing' && (
              <div className="space-y-3">
                {classes.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      No scheduled classes found.
                    </p>

                    <p className="mt-1 text-xs text-amber-700">
                      Select "New Recorded Class" to upload a
                      recording without scheduling a live class.
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 bg-emerald-500 text-white hover:bg-emerald-600"
                      onClick={() =>
                        setUploadMode('new')
                      }
                    >
                      Create Recorded Class
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>
                      Select Your Class
                    </Label>

                    <select
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={recordingClassId || ''}
                      onChange={(e) =>
                        setRecordingClassId(
                          e.target.value || null
                        )
                      }
                    >
                      <option value="">
                        Select a class...
                      </option>

                      {classes.map((courseClass) => (
                        <option
                          key={courseClass.id}
                          value={courseClass.id}
                        >
                          {courseClass.title}
                          {courseClass.courses?.title
                            ? ` — ${courseClass.courses.title}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* ==================================================
                NEW RECORDED CLASS
            =================================================== */}

            {uploadMode === 'new' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-sm font-medium text-emerald-800">
                    Upload without scheduling
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    This will create a completed recorded class
                    directly under your course.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Class Title *</Label>

                  <Input
                    value={directRecordingTitle}
                    onChange={(e) =>
                      setDirectRecordingTitle(
                        e.target.value
                      )
                    }
                    placeholder="Algebra Chapter 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Your Course *</Label>

                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={directRecordingCourseId}
                    onChange={(e) =>
                      setDirectRecordingCourseId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select your course...
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>

                  <Textarea
                    value={directRecordingDescription}
                    onChange={(e) =>
                      setDirectRecordingDescription(
                        e.target.value
                      )
                    }
                    placeholder="What was covered in this class?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Class Date & Time
                  </Label>

                  <Input
                    type="datetime-local"
                    value={directRecordingStartTime}
                    onChange={(e) =>
                      setDirectRecordingStartTime(
                        e.target.value
                      )
                    }
                  />

                  <p className="text-xs text-slate-500">
                    Leave empty to use the current date and time.
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                VIDEO
            =================================================== */}

            <div className="space-y-2">
              <Label>
                Video File *
              </Label>

              <Input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                onChange={(e) =>
                  setDirectRecordingFile(
                    e.target.files?.[0] || null
                  )
                }
              />

              <p className="text-xs text-slate-500">
                MP4, WebM, MOV, AVI or MKV • Maximum 500 MB
              </p>
            </div>

            {directRecordingFile && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Video className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {directRecordingFile.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(
                        directRecordingFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{' '}
                      MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={uploadingRecording}
              onClick={() => {
                setRecordingDialogOpen(false);
                resetRecordingDialog();
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={
                uploadingRecording ||
                !directRecordingFile ||
                (uploadMode === 'existing' &&
                  (!recordingClassId ||
                    classes.length === 0)) ||
                (uploadMode === 'new' &&
                  (!directRecordingTitle.trim() ||
                    !directRecordingCourseId))
              }
              onClick={handleUploadRecording}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {uploadingRecording ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Recording
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          END LIVE CLASS DIALOG
      ======================================================= */}

      <Dialog
        open={endDialogOpen}
        onOpenChange={(open) => {
          if (uploadingRecording) return;

          setEndDialogOpen(open);

          if (!open) {
            setEndingClassId(null);
            setRecordingUrl('');
            setRecordingFile(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              End Live Class
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">
              Add a recording link or upload the local class
              recording so students can watch it later.
            </p>

            <div className="space-y-2">
              <Label>
                Recording URL{' '}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </Label>

              <Input
                value={recordingUrl}
                onChange={(e) =>
                  setRecordingUrl(e.target.value)
                }
                placeholder="https://example.com/recording/..."
              />
            </div>

            <div className="space-y-2">
              <Label>
                Upload local video{' '}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </Label>

              <Input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                onChange={(e) =>
                  setRecordingFile(
                    e.target.files?.[0] || null
                  )
                }
              />

              <p className="text-xs text-slate-500">
                MP4, WebM, MOV, AVI or MKV up to 500 MB.
              </p>

              {recordingFile && (
                <p className="text-xs font-medium text-slate-700">
                  Selected: {recordingFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={uploadingRecording}
              onClick={() =>
                setEndDialogOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              disabled={uploadingRecording}
              onClick={handleEndLive}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {uploadingRecording ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'End Class'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          CLASS CARDS
      ======================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((courseClass) => (
          <Card
            key={courseClass.id}
            className="border-slate-200 shadow-sm transition-all hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Video className="h-5 w-5 text-red-500" />
                </div>

                <div className="flex items-center gap-2">
                  {courseClass.status === 'live' && (
                    <span className="live-dot" />
                  )}

                  <Badge
                    className={
                      statusColor[courseClass.status] ||
                      'bg-slate-100 text-slate-600'
                    }
                  >
                    {courseClass.status}
                  </Badge>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900">
                {courseClass.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {courseClass.description ||
                  'No description'}
              </p>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(
                    courseClass.start_time
                  ).toLocaleString()}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {courseClass.duration_minutes} minutes
                </div>

                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5" />
                  {courseClass.courses?.title ||
                    'No course'}
                </div>

                {courseClass.meeting_link && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />

                    <a
                      href={courseClass.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline"
                    >
                      Join meeting
                    </a>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {courseClass.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleStartLive(
                        courseClass.id
                      )
                    }
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Play className="mr-1 h-3.5 w-3.5" />
                    Go Live
                  </Button>
                )}

                {courseClass.status === 'live' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      openEndDialog(
                        courseClass.id
                      )
                    }
                  >
                    End Class
                  </Button>
                )}

                {/* Upload / replace recording for any class */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openRecordingDialog(
                      courseClass.id
                    )
                  }
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <Upload className="mr-1 h-3.5 w-3.5" />

                  {courseClass.recording_path
                    ? 'Replace Recording'
                    : 'Upload Recording'}
                </Button>

                {courseClass.status === 'completed' &&
                  (courseClass.recording_url ||
                    courseClass.recording_path) && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Recording available
                    </div>
                  )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleDelete(
                      courseClass.id
                    )
                  }
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* ====================================================
            EMPTY STATE
        ===================================================== */}

        {classes.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <Video className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              No live classes yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Schedule a live class or upload a recorded
              class directly.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  openRecordingDialog()
                }
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Recording
              </Button>

              <Button
                onClick={() =>
                  setDialogOpen(true)
                }
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule Class
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
