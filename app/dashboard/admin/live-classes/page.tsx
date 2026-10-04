'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Video,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Link2,
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

export default function AdminLiveClassesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [recordingDialogOpen, setRecordingDialogOpen] = useState(false);
  const [recordingClassId, setRecordingClassId] = useState<string | null>(null);
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const [uploadingRecording, setUploadingRecording] = useState(false);

  const [uploadMode, setUploadMode] = useState<UploadMode>('existing');
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingDescription, setRecordingDescription] = useState('');
  const [recordingCourseId, setRecordingCourseId] = useState('');
  const [recordingStartTime, setRecordingStartTime] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    start_time: '',
    duration_minutes: 60,
    meeting_link: '',
  });

  const canManage = useMemo(
    () => profile?.role === 'admin' || profile?.role === 'teacher',
    [profile?.role]
  );

  // ============================================================
  // AUTH
  // ============================================================

  useEffect(() => {
    if (!loading && (!user || !canManage)) {
      router.push('/login');
    }
  }, [loading, user, canManage, router]);

  // ============================================================
  // FETCH CLASSES
  // ============================================================

  const fetchClasses = async () => {
    setDataLoading(true);

    const { data, error } = await supabase
      .from('live_classes')
      .select(`
        *,
        courses (
          title,
          teacher_id
        ),
        profiles!live_classes_teacher_id_fkey (
          full_name
        )
      `)
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
  // FETCH COURSES
  // ============================================================

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, teacher_id')
      .order('title');

    if (error) {
      console.error('fetchCourses:', error);
      toast.error('Could not load courses');
      return;
    }

    setCourses(data || []);
  };

  useEffect(() => {
    if (canManage) {
      fetchClasses();
      fetchCourses();
    }
  }, [canManage]);

  // ============================================================
  // CREATE SCHEDULED LIVE CLASS
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

    const course = courses.find((c) => c.id === formData.course_id);

    if (!course) {
      toast.error('Selected course not found');
      return;
    }

    if (!course.teacher_id) {
      toast.error('This course does not have a teacher assigned');
      return;
    }

    const { error } = await supabase.from('live_classes').insert({
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      course_id: formData.course_id,
      teacher_id: course.teacher_id,
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
  // OPEN RECORDING DIALOG
  //
  // id = existing scheduled class
  // no id = direct/new recorded class
  // ============================================================

  const openRecordingDialog = (id?: string) => {
    setRecordingClassId(id || null);
    setRecordingFile(null);

    if (id) {
      setUploadMode('existing');
    } else {
      setUploadMode(classes.length > 0 ? 'existing' : 'new');
    }

    setRecordingTitle('');
    setRecordingDescription('');
    setRecordingCourseId('');
    setRecordingStartTime('');
    setRecordingDialogOpen(true);
  };

  const resetRecordingDialog = () => {
    setRecordingClassId(null);
    setRecordingFile(null);
    setRecordingTitle('');
    setRecordingDescription('');
    setRecordingCourseId('');
    setRecordingStartTime('');
    setUploadMode('existing');
  };

  // ============================================================
  // UPLOAD RECORDING
  //
  // MODE 1: existing scheduled class
  // MODE 2: create class + upload recording directly
  // ============================================================

  const handleUploadRecording = async () => {
    if (!user) {
      toast.error('You are not logged in');
      return;
    }

    if (!recordingFile) {
      toast.error('Choose a video first');
      return;
    }

    if (!ALLOWED_VIDEO_TYPES.includes(recordingFile.type)) {
      toast.error(
        'Only MP4, WebM, MOV, AVI or MKV videos are allowed'
      );
      return;
    }

    if (recordingFile.size > MAX_FILE_SIZE) {
      toast.error('Video must be smaller than 500 MB');
      return;
    }

    if (uploadMode === 'existing' && !recordingClassId) {
      toast.error('Please select a class');
      return;
    }

    if (uploadMode === 'new') {
      if (!recordingTitle.trim()) {
        toast.error('Please enter the class title');
        return;
      }

      if (!recordingCourseId) {
        toast.error('Please select a course');
        return;
      }
    }

    let createdClassId: string | null = null;
    let classId: string | null = recordingClassId;
    let oldRecordingPath: string | null = null;
    let storagePath: string | null = null;

    try {
      setUploadingRecording(true);

      // ========================================================
      // MODE 1: EXISTING CLASS
      // ========================================================

      if (uploadMode === 'existing') {
        const { data: liveClass, error: classError } = await supabase
          .from('live_classes')
          .select('id, recording_path')
          .eq('id', recordingClassId!)
          .single();

        if (classError || !liveClass) {
          throw new Error('Live class not found');
        }

        classId = liveClass.id;
        oldRecordingPath = liveClass.recording_path || null;
      }

      // ========================================================
      // MODE 2: NEW RECORDED CLASS
      // ========================================================

      if (uploadMode === 'new') {
        const course = courses.find((c) => c.id === recordingCourseId);

        if (!course) {
          throw new Error('Selected course not found');
        }

        if (!course.teacher_id) {
          throw new Error(
            'This course does not have a teacher assigned'
          );
        }

        const { data: newClass, error: createError } = await supabase
          .from('live_classes')
          .insert({
            title: recordingTitle.trim(),
            description: recordingDescription.trim() || null,
            course_id: course.id,
            teacher_id: course.teacher_id,
            start_time: recordingStartTime
              ? new Date(recordingStartTime).toISOString()
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
          console.error('create recorded class:', createError);
          throw new Error(
            createError?.message || 'Could not create recorded class'
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
        const { error: deleteError } = await supabase.storage
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
        recordingFile.name.split('.').pop()?.toLowerCase() || 'mp4';

      storagePath =
        `${user.id}/${classId}/${crypto.randomUUID()}.${extension}`;

      // ========================================================
      // UPLOAD VIDEO
      // ========================================================

      const { error: uploadError } = await supabase.storage
        .from('recorded-class-videos')
        .upload(storagePath, recordingFile, {
          cacheControl: '3600',
          contentType: recordingFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);

        if (createdClassId) {
          await supabase
            .from('live_classes')
            .delete()
            .eq('id', createdClassId);
        }

        throw uploadError;
      }

      // ========================================================
      // SAVE RECORDING PATH
      // ========================================================

      const { error: updateError } = await supabase
        .from('live_classes')
        .update({
          recording_path: storagePath,
          recording_url: null,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', classId);

      if (updateError) {
        // Rollback storage if DB update fails.
        await supabase.storage
          .from('recorded-class-videos')
          .remove([storagePath]);

        if (createdClassId) {
          await supabase
            .from('live_classes')
            .delete()
            .eq('id', createdClassId);
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
      console.error('Recording upload failed:', error);

      toast.error(
        error?.message || 'Could not upload recording'
      );
    } finally {
      setUploadingRecording(false);
    }
  };

  // ============================================================
  // DELETE CLASS
  // ============================================================

  const handleDelete = async (id: string) => {
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('recording_path')
      .eq('id', id)
      .single();

    if (liveClass?.recording_path) {
      await supabase.storage
        .from('recorded-class-videos')
        .remove([liveClass.recording_path]);
    }

    const { error } = await supabase
      .from('live_classes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Live class deleted');
    await fetchClasses();
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
    <DashboardShell role="admin">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Live Classes
          </h1>

          <p className="text-sm text-slate-500">
            Manage scheduled classes and recordings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* DIRECT RECORDING BUTTON */}
          <Button
            variant="outline"
            onClick={() => openRecordingDialog()}
            className="border-sky-200 text-sky-600 hover:bg-sky-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Recording
          </Button>

          {/* SCHEDULE BUTTON */}
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-sky-500 text-white hover:bg-sky-600">
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
                    placeholder="Advanced Mathematics"
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
                    <Label>Duration</Label>

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
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreate}
                  className="bg-sky-500 text-white hover:bg-sky-600"
                >
                  Schedule Class
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ======================================================
          RECORDING DIALOG
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
                    ? 'bg-white text-sky-600 shadow-sm'
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
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                New Recorded Class
              </button>
            </div>

            {/* ==================================================
                EXISTING CLASS MODE
            =================================================== */}

            {uploadMode === 'existing' && (
              <div className="space-y-3">
                {classes.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      No scheduled classes found.
                    </p>

                    <p className="mt-1 text-xs text-amber-700">
                      Select "New Recorded Class" above to upload
                      a recording without scheduling a live class.
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 bg-sky-500 text-white hover:bg-sky-600"
                      onClick={() => setUploadMode('new')}
                    >
                      Create Recorded Class
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Select Scheduled Class</Label>

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

                      {classes.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.title}
                          {c.courses?.title
                            ? ` — ${c.courses.title}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* ==================================================
                NEW RECORDED CLASS MODE
            =================================================== */}

            {uploadMode === 'new' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                  <p className="text-sm font-medium text-sky-800">
                    Direct recording upload
                  </p>

                  <p className="mt-1 text-xs text-sky-600">
                    No live class needs to be scheduled first.
                    The system will automatically create a
                    completed class after the upload.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Class Title *</Label>

                  <Input
                    value={recordingTitle}
                    onChange={(e) =>
                      setRecordingTitle(e.target.value)
                    }
                    placeholder="SSC CGL Maths - Percentage"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course *</Label>

                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={recordingCourseId}
                    onChange={(e) =>
                      setRecordingCourseId(e.target.value)
                    }
                  >
                    <option value="">
                      Select course...
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
                    value={recordingDescription}
                    onChange={(e) =>
                      setRecordingDescription(
                        e.target.value
                      )
                    }
                    placeholder="Class description..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Class Date & Time</Label>

                  <Input
                    type="datetime-local"
                    value={recordingStartTime}
                    onChange={(e) =>
                      setRecordingStartTime(
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
                VIDEO FILE
            =================================================== */}

            <div className="space-y-2">
              <Label>Video File *</Label>

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
                MP4, WebM, MOV, AVI or MKV • Maximum 500 MB
              </p>
            </div>

            {/* FILE PREVIEW */}
            {recordingFile && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                    <Video className="h-5 w-5 text-sky-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {recordingFile.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(
                        recordingFile.size /
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
                !recordingFile ||
                (uploadMode === 'existing' &&
                  (!recordingClassId ||
                    classes.length === 0)) ||
                (uploadMode === 'new' &&
                  (!recordingTitle.trim() ||
                    !recordingCourseId))
              }
              onClick={handleUploadRecording}
              className="bg-sky-500 text-white hover:bg-sky-600"
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
          CLASS CARDS
      ======================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Card
            key={c.id}
            className="border-slate-200 shadow-sm hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <Video className="h-5 w-5 text-red-500" />
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      statusColor[c.status] ||
                      'bg-slate-100 text-slate-600'
                    }
                  >
                    {c.status}
                  </Badge>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(c.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900">
                {c.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {c.description || 'No description'}
              </p>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(c.start_time).toLocaleString()}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {c.duration_minutes} minutes
                </div>

                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5" />
                  {c.courses?.title || 'No course'}
                </div>

                {c.profiles?.full_name && (
                  <div>
                    Teacher:{' '}
                    <span className="font-medium text-slate-700">
                      {c.profiles.full_name}
                    </span>
                  </div>
                )}

                {c.meeting_link && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />

                    <a
                      href={c.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline"
                    >
                      Join meeting
                    </a>
                  </div>
                )}
              </div>

              {/* EXISTING CLASS RECORDING */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openRecordingDialog(c.id)}
                className="mt-4 w-full"
              >
                <Upload className="mr-2 h-3.5 w-3.5" />

                {c.recording_path
                  ? 'Replace Recording'
                  : 'Upload Recording'}
              </Button>

              {c.recording_path && (
                <div className="mt-2 rounded-md bg-green-50 p-2 text-center text-xs text-green-700">
                  ✓ Recording available
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 py-16 text-center">
            <Video className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              No live classes scheduled
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You can schedule a class or upload a recorded class
              directly.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => openRecordingDialog()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Recording
              </Button>

              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-sky-500 text-white hover:bg-sky-600"
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
