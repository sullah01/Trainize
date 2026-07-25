"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteLessonButton({
  lessonId,
  nextHref,
  alreadyDone,
}: {
  lessonId: string;
  nextHref: string;
  alreadyDone: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    if (!alreadyDone) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
    }
    setLoading(false);
    router.push(nextHref);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
    >
      {loading ? "Saving..." : alreadyDone ? "Continue →" : "Mark complete & continue →"}
    </button>
  );
}
