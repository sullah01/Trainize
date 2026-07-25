import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { category: true } }),
    prisma.category.findMany(),
  ]);

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            Free online courses.{" "}
            <span className="text-brand-500">Real certificates.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600">
            Learn business, technology, health, and personal development skills at your own pace — and earn a
            certificate when you're done.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Browse courses
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/courses?category=${c.slug}`}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Popular courses</h2>
          <Link href="/courses" className="text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group overflow-hidden rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md"
            >
              <div
                className="flex h-32 items-center justify-center text-4xl font-black text-white/90"
                style={{ backgroundColor: course.imageColor }}
              >
                {course.title.slice(0, 1)}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  {course.category.name}
                </p>
                <h3 className="mt-1 font-bold text-gray-900 group-hover:text-brand-600">{course.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.subtitle}</p>
                <p className="mt-3 text-xs font-medium text-gray-400">
                  {course.level} · {course.hours}h
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
