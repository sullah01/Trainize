"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({
  courseId,
  isLoggedIn,
  firstLessonHref,
}: {
  courseId: string;
  isLoggedIn: boolean;
  firstLessonHref: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(firstLessonHref);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
    >
      {loading ? "Enrolling..." : "Enroll for free"}
    </button>
  );
}
