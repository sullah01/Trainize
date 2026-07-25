"use client";

import { useState } from "react";
import type { CourseFull, LessonFull, ModuleFull, QuestionFull } from "./types";

export default function ModulesEditor({ course, onChange }: { course: CourseFull; onChange: () => void }) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [adding, setAdding] = useState(false);

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setAdding(true);
    await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, title: newModuleTitle }),
    });
    setNewModuleTitle("");
    setAdding(false);
    onChange();
  }

  return (
    <div className="space-y-5">
      {course.modules.map((module, mi) => (
        <ModuleCard key={module.id} module={module} index={mi} onChange={onChange} />
      ))}

      <form onSubmit={addModule} className="flex gap-2 rounded-xl border border-dashed border-gray-300 p-4">
        <input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title (e.g. Advanced Topics)"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          disabled={adding}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          + Add module
        </button>
      </form>
    </div>
  );
}

function ModuleCard({ module, index, onChange }: { module: ModuleFull; index: number; onChange: () => void }) {
  const [title, setTitle] = useState(module.title);
  const [editing, setEditing] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"VIDEO" | "TEXT" | "QUIZ">("TEXT");
  const [adding, setAdding] = useState(false);

  async function saveTitle() {
    await fetch(`/api/admin/modules/${module.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setEditing(false);
    onChange();
  }

  async function deleteModule() {
    if (!confirm(`Delete module "${module.title}" and all its lessons?`)) return;
    await fetch(`/api/admin/modules/${module.id}`, { method: "DELETE" });
    onChange();
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setAdding(true);
    await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: module.id, title: newLessonTitle, type: newLessonType }),
    });
    setNewLessonTitle("");
    setAdding(false);
    onChange();
  }

  return (
    <div className="rounded-xl border border-gray-100">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
        {editing ? (
          <div className="flex flex-1 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-brand-500"
            />
            <button onClick={saveTitle} className="text-sm font-semibold text-brand-600">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-400">
              Cancel
            </button>
          </div>
        ) : (
          <span className="font-semibold text-gray-800">
            Module {index + 1}: {module.title}
          </span>
        )}
        {!editing && (
          <div className="flex gap-3 text-sm">
            <button onClick={() => setEditing(true)} className="font-semibold text-brand-600 hover:underline">
              Rename
            </button>
            <button onClick={deleteModule} className="font-semibold text-red-500 hover:underline">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {module.lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onChange={onChange} />
        ))}
      </div>

      <form onSubmit={addLesson} className="flex gap-2 p-3">
        <input
          value={newLessonTitle}
          onChange={(e) => setNewLessonTitle(e.target.value)}
          placeholder="New lesson title"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
        <select
          value={newLessonType}
          onChange={(e) => setNewLessonType(e.target.value as any)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="TEXT">Text</option>
          <option value="VIDEO">Video</option>
          <option value="QUIZ">Quiz</option>
        </select>
        <button
          disabled={adding}
          className="rounded-full border border-brand-500 px-4 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
        >
          + Add
        </button>
      </form>
    </div>
  );
}

function LessonCard({ lesson, onChange }: { lesson: LessonFull; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [durationMin, setDurationMin] = useState(lesson.durationMin);
  const [saving, setSaving] = useState(false);

  const icon = lesson.type === "VIDEO" ? "▶" : lesson.type === "QUIZ" ? "✎" : "≡";

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, videoUrl: videoUrl || null, durationMin }),
    });
    setSaving(false);
    onChange();
  }

  async function deleteLesson() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    await fetch(`/api/admin/lessons/${lesson.id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setOpen(!open)} className="flex flex-1 items-center gap-2 text-left">
          <span className="w-4 text-xs text-gray-400">{icon}</span>
          <span className="text-sm text-gray-700">{lesson.title}</span>
          <span className="text-xs text-gray-400">({lesson.type.toLowerCase()})</span>
        </button>
        <div className="flex gap-3 text-xs">
          <button onClick={() => setOpen(!open)} className="font-semibold text-brand-600 hover:underline">
            {open ? "Close" : "Edit"}
          </button>
          <button onClick={deleteLesson} className="font-semibold text-red-500 hover:underline">
            Delete
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          </div>

          {lesson.type !== "QUIZ" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  {lesson.type === "VIDEO" ? "Video URL" : "Body text"}
                </label>
                {lesson.type === "VIDEO" ? (
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                  />
                ) : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  {lesson.type === "VIDEO" ? "Caption / notes" : "Lesson content"}
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-32 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-brand-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save lesson"}
          </button>

          {lesson.type === "QUIZ" && <QuizEditor lessonId={lesson.id} quiz={lesson.quiz} onChange={onChange} />}
        </div>
      )}
    </div>
  );
}

function QuizEditor({
  lessonId,
  quiz,
  onChange,
}: {
  lessonId: string;
  quiz: { id: string; passingScore: number; questions: QuestionFull[] } | null;
  onChange: () => void;
}) {
  const [passingScore, setPassingScore] = useState(quiz?.passingScore ?? 70);
  const [questions, setQuestions] = useState<QuestionFull[]>(
    quiz?.questions.length
      ? quiz.questions
      : [{ id: "tmp-1", text: "", options: ["", ""], correctIndex: 0 }]
  );
  const [saving, setSaving] = useState(false);

  function updateQuestion(qi: number, patch: Partial<QuestionFull>) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q))
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, { id: `tmp-${qs.length + 1}`, text: "", options: ["", ""], correctIndex: 0 }]);
  }

  function removeQuestion(qi: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== qi));
  }

  function addOption(qi: number) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q)));
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oi),
              correctIndex: q.correctIndex >= oi && q.correctIndex > 0 ? q.correctIndex - 1 : q.correctIndex,
            }
          : q
      )
    );
  }

  async function saveQuiz() {
    setSaving(true);
    await fetch(`/api/admin/lessons/${lessonId}/quiz`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passingScore,
        questions: questions.map((q) => ({ text: q.text, options: q.options, correctIndex: q.correctIndex })),
      }),
    });
    setSaving(false);
    onChange();
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-600">Passing score (%)</label>
        <input
          type="number"
          min={1}
          max={100}
          value={passingScore}
          onChange={(e) => setPassingScore(Number(e.target.value))}
          className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <input
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder={`Question ${qi + 1}`}
              className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
            />
            <button onClick={() => removeQuestion(qi)} className="text-xs font-semibold text-red-500">
              Remove
            </button>
          </div>
          <div className="mt-2 space-y-1.5">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correctIndex === oi}
                  onChange={() => updateQuestion(qi, { correctIndex: oi })}
                  className="accent-brand-500"
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                  className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-brand-500"
                />
                {q.options.length > 2 && (
                  <button onClick={() => removeOption(qi, oi)} className="text-xs text-gray-400 hover:text-red-500">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addOption(qi)} className="text-xs font-semibold text-brand-600 hover:underline">
              + Add option
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={addQuestion} className="text-xs font-semibold text-brand-600 hover:underline">
          + Add question
        </button>
        <button
          onClick={saveQuiz}
          disabled={saving}
          className="rounded-full bg-brand-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save quiz"}
        </button>
      </div>
    </div>
  );
}
