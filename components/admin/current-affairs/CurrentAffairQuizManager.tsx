"use client";

import { useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  FileQuestion,
  Check,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type QuizOption = {
  text: string;
};

type QuizQuestion = {
  id: string;
  affair_id: string;
  question_order: number;
  question_text: string;
  options: QuizOption[];
  correct_answer: number;
  explanation: string | null;
  points: number;
};

type Props = {
  affairId: string;
  questions: QuizQuestion[];
  onQuestionsChange: (
    questions: QuizQuestion[]
  ) => void;
};

type FormState = {
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  points: number;
};

const emptyForm: FormState = {
  question_text: "",
  options: [
    "",
    "",
    "",
    "",
  ],
  correct_answer: 0,
  explanation: "",
  points: 1,
};

export default function CurrentAffairQuizManager({
  affairId,
  questions,
  onQuestionsChange,
}: Props) {
  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * =====================================================
   * RESET FORM
   * =====================================================
   */

  function resetForm() {
    setForm({
      ...emptyForm,
      options: [
        "",
        "",
        "",
        "",
      ],
    });

    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  /*
   * =====================================================
   * OPEN ADD FORM
   * =====================================================
   */

  function openAddForm() {
    setForm({
      ...emptyForm,
      options: [
        "",
        "",
        "",
        "",
      ],
    });

    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  /*
   * =====================================================
   * OPEN EDIT FORM
   * =====================================================
   */

  function openEditForm(
    question: QuizQuestion
  ) {
    setForm({
      question_text:
        question.question_text,

      options: [
        question.options?.[0]?.text ||
          "",
        question.options?.[1]?.text ||
          "",
        question.options?.[2]?.text ||
          "",
        question.options?.[3]?.text ||
          "",
      ],

      correct_answer:
        question.correct_answer,

      explanation:
        question.explanation || "",

      points:
        question.points || 1,
    });

    setEditingId(question.id);
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * =====================================================
   * UPDATE OPTION
   * =====================================================
   */

  function updateOption(
    index: number,
    value: string
  ) {
    setForm((previous) => {
      const options = [
        ...previous.options,
      ];

      options[index] = value;

      return {
        ...previous,
        options,
      };
    });
  }

  /*
   * =====================================================
   * VALIDATE
   * =====================================================
   */

  function validateForm() {
    if (
      !form.question_text.trim()
    ) {
      return "Question is required.";
    }

    for (
      let i = 0;
      i < 4;
      i++
    ) {
      if (
        !form.options[i]?.trim()
      ) {
        return `Option ${
          String.fromCharCode(
            65 + i
          )
        } is required.`;
      }
    }

    if (
      form.correct_answer < 0 ||
      form.correct_answer > 3
    ) {
      return "Please select the correct answer.";
    }

    if (
      !form.points ||
      form.points < 1
    ) {
      return "Points must be at least 1.";
    }

    return null;
  }

  /*
   * =====================================================
   * SAVE QUESTION
   * =====================================================
   */

  async function saveQuestion() {
    setError("");
    setSuccess("");

    const validation =
      validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);

    try {
      const options =
        form.options.map(
          (text) => ({
            text: text.trim(),
          })
        );

      /*
       * -----------------------------------------------
       * UPDATE EXISTING QUESTION
       * -----------------------------------------------
       */

      if (editingId) {
        const {
          data,
          error,
        } = await supabase
          .from(
            "current_affair_questions"
          )
          .update({
            question_text:
              form.question_text.trim(),

            options,

            correct_answer:
              form.correct_answer,

            explanation:
              form.explanation.trim() ||
              null,

            points:
              form.points,
          })
          .eq("id", editingId)
          .eq(
            "affair_id",
            affairId
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        const updated =
          normalizeQuestion(data);

        const updatedQuestions =
          questions.map(
            (question) =>
              question.id ===
              editingId
                ? updated
                : question
          );

        onQuestionsChange(
          updatedQuestions
        );

        setSuccess(
          "Question updated successfully."
        );
      }

      /*
       * -----------------------------------------------
       * CREATE NEW QUESTION
       * -----------------------------------------------
       */

      else {
        const nextOrder =
          questions.length > 0
            ? Math.max(
                ...questions.map(
                  (question) =>
                    question.question_order
                )
              ) + 1
            : 1;

        const {
          data,
          error,
        } = await supabase
          .from(
            "current_affair_questions"
          )
          .insert({
            affair_id:
              affairId,

            question_order:
              nextOrder,

            question_text:
              form.question_text.trim(),

            options,

            correct_answer:
              form.correct_answer,

            explanation:
              form.explanation.trim() ||
              null,

            points:
              form.points,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        const newQuestion =
          normalizeQuestion(data);

        onQuestionsChange([
          ...questions,
          newQuestion,
        ]);

        setSuccess(
          "Question added successfully."
        );
      }

      /*
       * Keep form open after save for
       * adding/editing another question.
       */

      if (!editingId) {
        setForm({
          ...emptyForm,
          options: [
            "",
            "",
            "",
            "",
          ],
        });
      } else {
        setShowForm(false);
        setEditingId(null);
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to save question."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================================
   * DELETE QUESTION
   * =====================================================
   */

  async function deleteQuestion(
    question: QuizQuestion
  ) {
    const confirmed =
      window.confirm(
        `Delete question ${
          question.question_order
        }?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      question.id
    );

    setError("");
    setSuccess("");

    try {
      const {
        error,
      } = await supabase
        .from(
          "current_affair_questions"
        )
        .delete()
        .eq(
          "id",
          question.id
        )
        .eq(
          "affair_id",
          affairId
        );

      if (error) {
        throw error;
      }

      const remaining =
        questions
          .filter(
            (item) =>
              item.id !==
              question.id
          )
          .map(
            (
              item,
              index
            ) => ({
              ...item,
              question_order:
                index + 1,
            })
          );

      /*
       * Re-number remaining questions
       */

      for (
        const item of remaining
      ) {
        await supabase
          .from(
            "current_affair_questions"
          )
          .update({
            question_order:
              item.question_order,
          })
          .eq(
            "id",
            item.id
          );
      }

      onQuestionsChange(
        remaining
      );

      setSuccess(
        "Question deleted successfully."
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to delete question."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * =====================================================
   * MOVE QUESTION
   * =====================================================
   */

  async function moveQuestion(
    index: number,
    direction:
      | "up"
      | "down"
  ) {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= questions.length
    ) {
      return;
    }

    const current =
      questions[index];

    const target =
      questions[newIndex];

    try {
      /*
       * Temporary negative order prevents
       * duplicate-order conflicts.
       */

      await supabase
        .from(
          "current_affair_questions"
        )
        .update({
          question_order:
            -999999,
        })
        .eq(
          "id",
          current.id
        );

      await supabase
        .from(
          "current_affair_questions"
        )
        .update({
          question_order:
            current.question_order,
        })
        .eq(
          "id",
          target.id
        );

      await supabase
        .from(
          "current_affair_questions"
        )
        .update({
          question_order:
            target.question_order,
        })
        .eq(
          "id",
          current.id
        );

      const reordered =
        [...questions];

      reordered[index] =
        target;

      reordered[newIndex] =
        current;

      reordered.forEach(
        (
          question,
          order
        ) => {
          question.question_order =
            order + 1;
        }
      );

      /*
       * Make final ordering
       */

      for (
        const question of reordered
      ) {
        await supabase
          .from(
            "current_affair_questions"
          )
          .update({
            question_order:
              question.question_order,
          })
          .eq(
            "id",
            question.id
          );
      }

      onQuestionsChange(
        reordered
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to reorder questions."
      );
    }
  }

  /*
   * =====================================================
   * NORMALIZE QUESTION
   * =====================================================
   */

  function normalizeQuestion(
    question: any
  ): QuizQuestion {
    return {
      id: question.id,

      affair_id:
        question.affair_id,

      question_order:
        Number(
          question.question_order
        ),

      question_text:
        question.question_text,

      options:
        Array.isArray(
          question.options
        )
          ? question.options
          : [],

      correct_answer:
        Number(
          question.correct_answer
        ),

      explanation:
        question.explanation ||
        null,

      points:
        Number(
          question.points
        ) || 1,
    };
  }

  return (
    <div className="space-y-6">

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-lg font-extrabold text-slate-900">
            Quiz Questions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {questions.length}{" "}
            {questions.length === 1
              ? "question"
              : "questions"}{" "}
            added
          </p>

        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#052f70]"
        >
          <Plus size={18} />
          Add Question
        </button>

      </div>

      {/* =================================================
          QUESTION FORM
      ================================================= */}

      {showForm && (
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h2 className="text-xl font-extrabold text-slate-900">
                {editingId
                  ? "Edit Question"
                  : "Add New Question"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the question, four options,
                correct answer and explanation.
              </p>

            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>

          </div>

          <div className="space-y-6">

            {/* QUESTION */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-800">
                Question
              </label>

              <textarea
                value={
                  form.question_text
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      question_text:
                        event.target.value,
                    })
                  )
                }
                rows={4}
                placeholder="Enter your question..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* OPTIONS */}

            <div>

              <div className="mb-3 flex items-center justify-between">

                <label className="text-sm font-bold text-slate-800">
                  Options
                </label>

                <span className="text-xs text-slate-500">
                  Select the radio button for the correct answer.
                </span>

              </div>

              <div className="space-y-3">

                {form.options.map(
                  (
                    option,
                    index
                  ) => {

                    const letter =
                      String.fromCharCode(
                        65 + index
                      );

                    const selected =
                      form.correct_answer ===
                      index;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                          selected
                            ? "border-green-400 bg-green-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >

                        {/* CORRECT RADIO */}

                        <button
                          type="button"
                          onClick={() =>
                            setForm(
                              (
                                previous
                              ) => ({
                                ...previous,
                                correct_answer:
                                  index,
                              })
                            )
                          }
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                            selected
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-slate-300 bg-white text-slate-500"
                          }`}
                          title={
                            selected
                              ? "Correct answer"
                              : "Mark as correct"
                          }
                        >
                          {selected ? (
                            <Check
                              size={17}
                            />
                          ) : (
                            letter
                          )}
                        </button>

                        {/* OPTION */}

                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            updateOption(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Option ${letter}`}
                          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-medium outline-none"
                        />

                        {selected && (
                          <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 sm:block">
                            Correct
                          </span>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* EXPLANATION */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-800">
                Explanation
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <textarea
                value={
                  form.explanation
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      explanation:
                        event.target.value,
                    })
                  )
                }
                rows={4}
                placeholder="Explain why the selected answer is correct..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* POINTS */}

            <div className="max-w-xs">

              <label className="mb-2 block text-sm font-bold text-slate-800">
                Points
              </label>

              <input
                type="number"
                min={1}
                max={100}
                value={form.points}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      points:
                        Number(
                          event.target.value
                        ) || 1,
                    })
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* FORM ACTIONS */}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveQuestion}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#052f70] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {editingId
                      ? "Update Question"
                      : "Save Question"}
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {questions.length === 0 &&
        !showForm && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#063B8F]">
              <FileQuestion
                size={30}
              />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-slate-900">
              No quiz questions yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create MCQ questions for this current
              affair. Students will see the quiz below
              the article.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3 text-sm font-bold text-white"
            >
              <Plus size={18} />
              Create First Question
            </button>

          </div>
        )}

      {/* =================================================
          QUESTION LIST
      ================================================= */}

      {questions.length > 0 && (
        <div className="space-y-4">

          {questions.map(
            (
              question,
              index
            ) => {

              const correctOption =
                question.options?.[
                  question.correct_answer
                ]?.text || "";

              return (
                <div
                  key={question.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* QUESTION HEADER */}

                  <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#063B8F] text-sm font-extrabold text-white">
                        Q{index + 1}
                      </div>

                      <div>

                        <h3 className="font-bold leading-6 text-slate-900">
                          {question.question_text}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {question.points}{" "}
                            {question.points ===
                            1
                              ? "point"
                              : "points"}
                          </span>

                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Correct:{" "}
                            {String.fromCharCode(
                              65 +
                                question.correct_answer
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          moveQuestion(
                            index,
                            "up"
                          )
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                          questions.length -
                            1
                        }
                        onClick={() =>
                          moveQuestion(
                            index,
                            "down"
                          )
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            question
                          )
                        }
                        className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                        title="Edit question"
                      >
                        <Pencil         
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          question.id
                        }
                        onClick={() =>
                          deleteQuestion(
                            question
                          )
                        }
                        className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete question"
                      >
                        {deletingId ===
                        question.id ? (
                          <span className="block h-[17px] w-[17px] animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2
                            size={17}
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* OPTIONS */}

                  <div className="grid gap-3 p-5 md:grid-cols-2">

                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => {

                        const isCorrect =
                          optionIndex ===
                          question.correct_answer;

                        return (
                          <div
                            key={
                              optionIndex
                            }
                            className={`rounded-xl border p-4 ${
                              isCorrect
                                ? "border-green-300 bg-green-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  isCorrect
                                    ? "bg-green-500 text-white"
                                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                                }`}
                              >
                                {String.fromCharCode(
                                  65 +
                                    optionIndex
                                )}
                              </span>

                              <div className="flex-1">

                                <div className="text-sm font-medium text-slate-700">
                                  {option.text}
                                </div>

                                {isCorrect && (
                                  <div className="mt-1 text-xs font-bold text-green-700">
                                    Correct answer
                                  </div>
                                )}

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* EXPLANATION */}

                  {question.explanation && (
                    <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">

                      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Explanation
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {question.explanation}
                      </p>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}