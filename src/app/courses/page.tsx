import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
      ...(searchParams.q
        ? {
            OR: [
              { title: { contains: searchParams.q, mode: "insensitive" } },
              { subtitle: { contains: searchParams.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">All courses</h1>

      <form className="mt-5 flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search courses..."
          className="w-full max-w-sm rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
            !searchParams.category
              ? "border-brand-500 bg-brand-50 text-brand-600"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/courses?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              searchParams.category === c.slug
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{course.category.name}</p>
              <h3 className="mt-1 font-bold text-gray-900 group-hover:text-brand-600">{course.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.subtitle}</p>
              <p className="mt-3 text-xs font-medium text-gray-400">
                {course.level} · {course.hours}h
              </p>
            </div>
          </Link>
        ))}
        {courses.length === 0 && <p className="text-gray-500">No courses found.</p>}
      </div>
    </div>
  );
}
