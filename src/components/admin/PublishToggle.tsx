"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishToggle({ courseId, published }: { courseId: string; published: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        published ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
