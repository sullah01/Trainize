import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EnrollButton from "@/components/EnrollButton";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id as string : null;

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstLesson = allLessons[0];

  let enrollment = null;
  let completedLessonIds = new Set<string>();
  if (userId) {
    enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    const progress = await prisma.lessonProgress.findMany({
      where: { userId, completed: true, lesson: { module: { courseId: course.id } } },
      select: { lessonId: true },
    });
    completedLessonIds = new Set(progress.map((p) => p.lessonId));
  }

  const progressPct = allLessons.length
    ? Math.round((completedLessonIds.size / allLessons.length) * 100)
    : 0;

  return (
    <div>
      <section style={{ backgroundColor: course.imageColor }} className="text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">{course.category.name}</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-xl text-white/90">{course.subtitle}</p>
          <p className="mt-4 text-sm text-white/80">
            {course.level} · {course.hours} hours · {allLessons.length} lessons
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">About this course</h2>
          <p className="mt-3 text-gray-600">{course.description}</p>

          <h2 className="mt-10 text-lg font-bold text-gray-900">Curriculum</h2>
          <div className="mt-4 space-y-4">
            {course.modules.map((module, mi) => (
              <div key={module.id} className="rounded-xl border border-gray-100">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-800">
                  Module {mi + 1}: {module.title}
                </div>
                <ul>
                  {module.lessons.map((lesson) => {
                    const done = completedLessonIds.has(lesson.id);
                    const icon = lesson.type === "VIDEO" ? "▶" : lesson.type === "QUIZ" ? "✎" : "≡";
                    return (
                      <li key={lesson.id} className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{icon}</span>
                          <span className="text-sm text-gray-700">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{lesson.durationMin} min</span>
                          {done && <span className="text-xs font-semibold text-emerald-600">✓ Done</span>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sticky top-20 rounded-xl border border-gray-100 p-6 shadow-sm">
            {enrollment ? (
              <>
                <p className="mb-2 text-sm font-semibold text-gray-700">Your progress</p>
                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-brand-500" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mb-4 text-xs text-gray-500">{progressPct}% complete</p>
                <Link
                  href={`/learn/${course.slug}/${firstLesson.id}`}
                  className="block w-full rounded-full bg-brand-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600"
                >
                  {progressPct > 0 ? "Continue learning" : "Start learning"}
                </Link>
                {progressPct === 100 && (
                  <Link
                    href={`/certificate/${course.id}`}
                    className="mt-3 block w-full rounded-full border border-brand-500 px-6 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50"
                  >
                    View certificate
                  </Link>
                )}
              </>
            ) : (
              <EnrollButton
                courseId={course.id}
                isLoggedIn={!!userId}
                firstLessonHref={`/learn/${course.slug}/${firstLesson.id}`}
              />
            )}
            <p className="mt-4 text-center text-xs text-gray-400">Free course · Certificate on completion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
