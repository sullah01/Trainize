"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = { id: string; text: string; options: string[] };

export default function QuizPlayer({
  quizId,
  questions,
  passingScore,
  nextHref,
  courseHref,
}: {
  quizId: string;
  questions: Question[];
  passingScore: number;
  nextHref: string;
  courseHref: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; courseCompleted: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers }),
    });
    const data = await res.json();
    setLoading(false);
    setResult(data);
  }

  function handleContinue() {
    router.push(result?.courseCompleted ? courseHref : nextHref);
    router.refresh();
  }

  if (result) {
    return (
      <div className="rounded-xl border border-gray-100 p-8 text-center">
        <p className={`text-4xl font-black ${result.passed ? "text-emerald-500" : "text-red-500"}`}>{result.score}%</p>
        <p className="mt-2 font-semibold text-gray-800">
          {result.passed ? "Nice work — you passed!" : `You need ${passingScore}% to pass. Try again.`}
        </p>
        {result.courseCompleted && (
          <p className="mt-2 text-sm font-semibold text-brand-600">🎉 Course complete — your certificate is ready!</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          {!result.passed && (
            <button
              onClick={() => setResult(null)}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
            >
              Retake quiz
            </button>
          )}
          <button
            onClick={handleContinue}
            className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            {result.courseCompleted ? "View certificate →" : result.passed ? "Continue →" : "Back to course"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-xl border border-gray-100 p-5">
          <p className="font-semibold text-gray-900">
            {qi + 1}. {q.text}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                  answers[q.id] === oi ? "border-brand-500 bg-brand-50" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === oi}
                  onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                  className="accent-brand-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
        className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit quiz"}
      </button>
    </div>
  );
}
