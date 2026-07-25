import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: { modules: { include: { lessons: true } } },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const allLessonIds = enrollments.flatMap((e) => e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId, completed: true, lessonId: { in: allLessonIds } },
    select: { lessonId: true },
  });
  const completedSet = new Set(progress.map((p) => p.lessonId));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">My Learning</h1>

      {enrollments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {enrollments.map(({ course, completedAt }) => {
            const lessons = course.modules.flatMap((m) => m.lessons);
            const done = lessons.filter((l) => completedSet.has(l.id)).length;
            const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
            const firstLesson = lessons[0];

            return (
              <div key={course.id} className="rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{course.level}</p>
                <h3 className="mt-1 font-bold text-gray-900">{course.title}</h3>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">{pct}% complete</p>

                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/learn/${course.slug}/${firstLesson?.id ?? ""}`}
                    className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                  >
                    {pct > 0 ? "Continue" : "Start"}
                  </Link>
                  {completedAt && (
                    <Link
                      href={`/certificate/${course.id}`}
                      className="rounded-full border border-brand-500 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      View certificate
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
