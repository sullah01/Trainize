"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COLOR_OPTIONS = ["#6D5BD0", "#1E9E8C", "#2563EB", "#E0855A", "#B0479A", "#3FA34D"];

export default function NewCourseForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    level: "Beginner",
    hours: 3,
    imageColor: COLOR_OPTIONS[0],
    categoryId: categories[0]?.id || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(`/admin/courses/${data.course.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Subtitle</label>
        <input
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Level</label>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Estimated hours</label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Card color</label>
          <div className="flex gap-2 pt-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm({ ...form, imageColor: c })}
                style={{ backgroundColor: c }}
                className={`h-8 w-8 rounded-full ${form.imageColor === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create course & continue"}
      </button>
    </form>
  );
}
