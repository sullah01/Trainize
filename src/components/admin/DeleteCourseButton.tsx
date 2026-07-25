"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCourseButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${courseTitle}"? This removes all its modules, lessons, and enrollments.`)) return;
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="font-semibold text-red-500 hover:underline disabled:opacity-50">
      Delete
    </button>
  );
}
