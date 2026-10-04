"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Phone,
  RotateCcw,
  Trophy,
  User,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type QuizOption = {
  text: string;
};

type Question = {
  id: string;
  affair_id: string;
  question_order: number;
  question_text: string;
  options: QuizOption[];
  points?: number;
};

type QuizResultItem = {
  question_id: string;
  question_order: number;
  selected_answer: number;
  correct_answer: number;
  is_correct: boolean;
  points_awarded: number;
  points: number;
  explanation?: string | null;
};

type QuizResult = {
  attempt_id: string;
  score: number;
  total_points: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;
  time_taken_seconds: number;
  results: QuizResultItem[];
};

type Props = {
  questions: Question[];
  affairId: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  // Accept +91XXXXXXXXXX / 91XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CurrentAffairQuiz({
  questions,
  affairId,
}: Props) {
  /* -------------------------------------------------------
     START FORM
  ------------------------------------------------------- */

  const [started, setStarted] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");

  const [formError, setFormError] = useState("");

  /* -------------------------------------------------------
     AUTH USER
  ------------------------------------------------------- */

  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  /* -------------------------------------------------------
     QUIZ STATE
  ------------------------------------------------------- */

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [submitted, setSubmitted] = useState(false);

  const [result, setResult] = useState<QuizResult | null>(null);

  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------
     TIMER
  ------------------------------------------------------- */

  const [startedAt, setStartedAt] = useState<number | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  /* =========================================================
     LOAD LOGGED-IN USER
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();

        if (!mounted || !data.user) {
          return;
        }

        const user = data.user;

        setLoggedInUserId(user.id);

        // Try profile name first
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profile?.full_name) {
          setStudentName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setStudentName(user.user_metadata.full_name);
        } else if (user.user_metadata?.name) {
          setStudentName(user.user_metadata.name);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (!started || submitted || !startedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      const now = Date.now();

      setElapsedSeconds(
        Math.floor((now - startedAt) / 1000)
      );
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [started, submitted, startedAt]);

  /* =========================================================
     RESULT MAP
  ========================================================= */

  const resultMap = useMemo(() => {
    const map = new Map<string, QuizResultItem>();

    if (!result?.results) {
      return map;
    }

    for (const item of result.results) {
      map.set(item.question_id, item);
    }

    return map;
  }, [result]);

  /* =========================================================
     START QUIZ
  ========================================================= */

  function startQuiz() {
    setFormError("");

    const name = studentName.trim();
    const normalizedPhone = normalizePhone(phone);

    if (name.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setFormError("Please enter a valid 10 digit mobile number.");
      return;
    }

    if (!questions.length) {
      setFormError("No questions are available for this quiz.");
      return;
    }

    setPhone(normalizedPhone);

    setAnswers({});
    setResult(null);
    setSubmitted(false);

    const now = Date.now();

    setStartedAt(now);
    setElapsedSeconds(0);
    setStarted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     SELECT ANSWER
  ========================================================= */

  function selectAnswer(questionId: string, optionIndex: number) {
    if (!started || submitted) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  }

  /* =========================================================
     SUBMIT QUIZ
  ========================================================= */

  async function submitQuiz() {
    if (loading || submitted) {
      return;
    }

    setFormError("");

    /*
      Require every question to be answered.
    */

    const unansweredQuestions = questions.filter(
      (question) => answers[question.id] === undefined
    );

    if (unansweredQuestions.length > 0) {
      setFormError(
        `Please answer all questions. ${unansweredQuestions.length} question${
          unansweredQuestions.length > 1 ? "s are" : " is"
        } unanswered.`
      );

      const firstUnanswered = unansweredQuestions[0];

      setTimeout(() => {
        const element = document.getElementById(
          `question-${firstUnanswered.id}`
        );

        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return;
    }

    const normalizedPhone = normalizePhone(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setFormError("Invalid mobile number.");
      return;
    }

    try {
      setLoading(true);

      /*
        Convert answers into the format expected
        by submit_current_affair_quiz RPC.
      */

      const answerPayload = questions.map((question) => ({
        question_id: question.id,
        selected_answer: answers[question.id],
      }));

      /*
        IMPORTANT:

        We DO NOT calculate score here.

        Supabase calculates the score using the
        correct_answer stored in the database.
      */

      const { data, error } = await supabase.rpc(
        "submit_current_affair_quiz",
        {
          p_affair_id: affairId,
          p_student_name: studentName.trim(),
          p_phone: normalizedPhone,
          p_answers: answerPayload,
          p_time_taken_seconds: elapsedSeconds,
        }
      );

      if (error) {
        console.error("Quiz submission error:", error);

        throw new Error(
          error.message || "Unable to submit quiz."
        );
      }

      if (!data) {
        throw new Error("No result returned from server.");
      }

      setResult(data as QuizResult);
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RESET / ATTEMPT AGAIN
  ========================================================= */

  function resetQuiz() {
    setStarted(false);
    setSubmitted(false);

    setAnswers({});
    setResult(null);

    setStartedAt(null);
    setElapsedSeconds(0);

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     PROGRESS
  ========================================================= */

  const answeredCount = Object.keys(answers).length;

  const progressPercentage =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  /* =========================================================
     EMPTY QUIZ
  ========================================================= */

  if (!questions.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Trophy className="h-7 w-7 text-slate-500" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Quiz Not Available
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Questions have not been added to this current affairs article yet.
        </p>
      </div>
    );
  }

  /* =========================================================
     START SCREEN
  ========================================================= */

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}

          <div className="bg-gradient-to-r from-[#063B8F] to-blue-700 px-6 py-8 text-white sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Trophy className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-center text-2xl font-extrabold sm:text-3xl">
              Current Affairs Quiz
            </h2>

            <p className="mx-auto mt-2 max-w-md text-center text-sm text-blue-100">
              Test your knowledge and get your instant result.
            </p>
          </div>

          {/* Form */}

          <div className="space-y-5 p-6 sm:p-8">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="student-name"
                  className="text-sm font-bold text-slate-800"
                >
                  Full Name
                </label>

                {loggedInUserId && (
                  <span className="text-xs font-medium text-green-600">
                    Logged in
                  </span>
                )}
              </div>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="student-name"
                  type="text"
                  value={studentName}
                  onChange={(event) =>
                    setStudentName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="student-phone"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Mobile Number
              </label>

              <div className="relative">
                <Phone
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="student-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter 10 digit mobile number"
                  maxLength={14}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Your mobile number is saved with this quiz attempt so the
                admin can identify the result.
              </p>
            </div>

            {/* Quiz info */}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Questions
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {questions.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Mode
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  Practice
                </p>
              </div>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <button
              type="button"
              onClick={startQuiz}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-800 active:scale-[0.99]"
            >
              Start Quiz
            </button>

            <p className="text-center text-xs text-slate-400">
              Make sure your details are correct before starting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RESULT SUMMARY
  ========================================================= */

  const score = result?.score ?? 0;
  const totalPoints = result?.total_points ?? 0;
  const percentage = result?.percentage ?? 0;
  const correctAnswers = result?.correct_answers ?? 0;
  const wrongAnswers = result?.wrong_answers ?? 0;
  const unanswered = result?.unanswered ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="sticky top-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              Current Affairs Quiz
            </p>

            <p className="text-xs text-slate-500">
              {studentName}
            </p>
          </div>

          {!submitted && (
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-[11px] font-medium text-slate-500">
                  Progress
                </p>

                <p className="text-sm font-bold text-slate-800">
                  {answeredCount}/{questions.length}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[#063B8F]">
                <Clock3 size={18} />

                <span className="font-mono text-sm font-extrabold">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {!submitted && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#063B8F] transition-all"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* =====================================================
          RESULT CARD
      ===================================================== */}

      {submitted && result && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#063B8F] to-blue-700 px-6 py-8 text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <Trophy className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-center text-2xl font-extrabold">
              Quiz Completed!
            </h2>

            <p className="mt-1 text-center text-sm text-blue-100">
              Well done, {studentName}
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {/* Score */}

            <div className="rounded-2xl bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                Your Score
              </p>

              <p className="mt-1 text-4xl font-black text-[#063B8F]">
                {score}
                <span className="text-2xl text-slate-400">
                  /{totalPoints}
                </span>
              </p>

              <p className="mt-2 text-sm font-bold text-slate-600">
                {percentage.toFixed(2)}%
              </p>
            </div>

            {/* Stats */}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />

                <p className="mt-2 text-xl font-extrabold text-green-700">
                  {correctAnswers}
                </p>

                <p className="text-xs font-medium text-green-700">
                  Correct
                </p>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                <XCircle className="mx-auto h-5 w-5 text-red-600" />

                <p className="mt-2 text-xl font-extrabold text-red-700">
                  {wrongAnswers}
                </p>

                <p className="text-xs font-medium text-red-700">
                  Wrong
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
                <Clock3 className="mx-auto h-5 w-5 text-amber-600" />

                <p className="mt-2 text-xl font-extrabold text-amber-700">
                  {unanswered}
                </p>

                <p className="text-xs font-medium text-amber-700">
                  Unanswered
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                <Trophy className="mx-auto h-5 w-5 text-blue-600" />

                <p className="mt-2 text-xl font-extrabold text-blue-700">
                  {formatTime(result.time_taken_seconds)}
                </p>

                <p className="text-xs font-medium text-blue-700">
                  Time
                </p>
              </div>
            </div>

            {/* Attempt Again */}

            <button
              type="button"
              onClick={resetQuiz}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#063B8F] bg-white px-5 py-3.5 text-sm font-extrabold text-[#063B8F] transition hover:bg-blue-50"
            >
              <RotateCcw size={18} />
              Attempt Again
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {formError && !submitted && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </div>
      )}

      {/* =====================================================
          QUESTIONS
      ===================================================== */}

      <div className="space-y-5">
        {questions.map((question, questionIndex) => {
          const selectedAnswer = answers[question.id];

          const questionResult = resultMap.get(question.id);

          return (
            <div
              key={question.id}
              id={`question-${question.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              {/* Question header */}

              <div className="flex gap-3">
                <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-50 px-2 text-sm font-extrabold text-[#063B8F]">
                  {questionIndex + 1}
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold leading-7 text-slate-900">
                    {question.question_text}
                  </h3>

                  {question.points !== undefined && (
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {question.points}{" "}
                      {question.points === 1 ? "mark" : "marks"}
                    </p>
                  )}
                </div>
              </div>

              {/* Options */}

              <div className="mt-5 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected =
                    selectedAnswer === optionIndex;

                  const isCorrect =
                    submitted &&
                    questionResult?.correct_answer === optionIndex;

                  const isWrongSelected =
                    submitted &&
                    isSelected &&
                    !isCorrect;

                  let optionClass =
                    "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50";

                  if (!submitted && isSelected) {
                    optionClass =
                      "border-blue-600 bg-blue-50 ring-2 ring-blue-100";
                  }

                  if (submitted && isCorrect) {
                    optionClass =
                      "border-green-500 bg-green-50";
                  }

                  if (submitted && isWrongSelected) {
                    optionClass =
                      "border-red-500 bg-red-50";
                  }

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        selectAnswer(
                          question.id,
                          optionIndex
                        )
                      }
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${optionClass} ${
                        submitted
                          ? "cursor-default"
                          : "cursor-pointer"
                      }`}
                    >
                      <span
                        className={`flex h-7 min-w-7 items-center justify-center rounded-full border text-xs font-extrabold ${
                          isSelected
                            ? "border-[#063B8F] bg-[#063B8F] text-white"
                            : "border-slate-300 bg-white text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>

                      <span className="flex-1 pt-0.5 text-sm font-medium leading-6 text-slate-800">
                        {option.text}
                      </span>

                      {submitted && isCorrect && (
                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0 text-green-600"
                        />
                      )}

                      {submitted && isWrongSelected && (
                        <XCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-red-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}

              {submitted && questionResult?.explanation && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#063B8F]">
                    Explanation
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {questionResult.explanation}
                  </p>
                </div>
              )}

              {/* Question result */}

              {submitted && questionResult && (
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                    questionResult.is_correct
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {questionResult.is_correct
                    ? `Correct • +${questionResult.points_awarded} ${
                        questionResult.points_awarded === 1
                          ? "mark"
                          : "marks"
                      }`
                    : questionResult.selected_answer === -1
                    ? "Not answered"
                    : "Incorrect"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================================
          SUBMIT BUTTON
      ===================================================== */}

      {!submitted && (
        <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>
              {answeredCount} of {questions.length} answered
            </span>

            <span>{progressPercentage}% complete</span>
          </div>

          <button
            type="button"
            onClick={submitQuiz}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Submit Quiz
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}