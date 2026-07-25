"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ModulesEditor from "./ModulesEditor";
import type { CourseFull } from "./types";

const COLOR_OPTIONS = ["#6D5BD0", "#1E9E8C", "#2563EB", "#E0855A", "#B0479A", "#3FA34D"];

export default function CourseEditor({
  courseId,
  categories,
}: {
  courseId: string;
  categories: { id: string; name: string }[];
}) {
  const [course, setCourse] = useState<CourseFull | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetch(`/api/admin/courses/${courseId}`);
    const data = await res.json();
    setCourse(data.course);
  }, [courseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function saveDetails() {
    if (!course) return;
    setSaving(true);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        level: course.level,
        hours: course.hours,
        imageColor: course.imageColor,
        categoryId: course.categoryId,
      }),
    });
    setSaving(false);
    setSavedAt(Date.now());
  }

  if (!course) {
    return <p className="text-gray-400">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm font-semibold text-brand-600 hover:underline">
          ← All courses
        </Link>
        <Link
          href={`/courses/${course.slug}`}
          target="_blank"
          className="text-sm font-semibold text-gray-500 hover:underline"
        >
          Preview live page ↗
        </Link>
      </div>

      <h1 className="mt-3 text-2xl font-extrabold text-gray-900">Edit course</h1>

      <section className="mt-6 space-y-4 rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800">Details</h2>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Title</label>
          <input
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Subtitle</label>
          <input
            value={course.subtitle}
            onChange={(e) => setCourse({ ...course, subtitle: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            rows={4}
            value={course.description}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
            <select
              value={course.categoryId}
              onChange={(e) => setCourse({ ...course, categoryId: e.target.value })}
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
              value={course.level}
              onChange={(e) => setCourse({ ...course, level: e.target.value })}
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
              value={course.hours}
              onChange={(e) => setCourse({ ...course, hours: Number(e.target.value) })}
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
                  onClick={() => setCourse({ ...course, imageColor: c })}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full ${course.imageColor === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveDetails}
            disabled={saving}
            className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save details"}
          </button>
          {savedAt && !saving && <span className="text-xs text-emerald-600">Saved ✓</span>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-bold text-gray-800">Curriculum</h2>
        <ModulesEditor course={course} onChange={refetch} />
      </section>
    </div>
  );
}
