import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompleteLessonButton from "@/components/CompleteLessonButton";
import QuizPlayer from "@/components/QuizPlayer";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, include: { quiz: { include: { questions: true } } } } },
      },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });
  if (!enrollment) redirect(`/courses/${course.slug}`);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId);
  if (currentIndex === -1) notFound();
  const lesson = allLessons[currentIndex];
  const nextLesson = allLessons[currentIndex + 1];
  const nextHref = nextLesson ? `/learn/${course.slug}/${nextLesson.id}` : `/courses/${course.slug}`;

  const progress = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: allLessons.map((l) => l.id) }, completed: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(progress.map((p) => p.lessonId));

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-brand-600 hover:underline">
          ← {course.title}
        </Link>
        <div className="mt-4 space-y-4">
          {course.modules.map((module, mi) => (
            <div key={module.id}>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                Module {mi + 1}: {module.title}
              </p>
              <ul className="space-y-0.5">
                {module.lessons.map((l) => {
                  const active = l.id === lesson.id;
                  const done = completedSet.has(l.id);
                  const icon = l.type === "VIDEO" ? "▶" : l.type === "QUIZ" ? "✎" : "≡";
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${course.slug}/${l.id}`}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                          active ? "bg-brand-50 font-semibold text-brand-600" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="w-4 text-xs text-gray-400">{icon}</span>
                        <span className="flex-1 truncate">{l.title}</span>
                        {done && <span className="text-xs text-emerald-500">✓</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-extrabold text-gray-900">{lesson.title}</h1>
        <p className="mt-1 text-sm text-gray-400">
          Lesson {currentIndex + 1} of {allLessons.length} · {lesson.durationMin} min
        </p>

        <div className="mt-6">
          {lesson.type === "VIDEO" && (
            <div className="space-y-4">
              {lesson.videoUrl && (
                <video controls className="w-full rounded-xl bg-black" src={lesson.videoUrl} />
              )}
              <p className="text-gray-600">{lesson.content}</p>
              <CompleteLessonButton
                lessonId={lesson.id}
                nextHref={nextHref}
                alreadyDone={completedSet.has(lesson.id)}
              />
            </div>
          )}

          {lesson.type === "TEXT" && (
            <div className="space-y-4">
              <p className="leading-relaxed text-gray-700">{lesson.content}</p>
              <CompleteLessonButton
                lessonId={lesson.id}
                nextHref={nextHref}
                alreadyDone={completedSet.has(lesson.id)}
              />
            </div>
          )}

          {lesson.type === "QUIZ" && lesson.quiz && (
            <div>
              <p className="mb-4 text-gray-600">{lesson.content}</p>
              <QuizPlayer
                quizId={lesson.quiz.id}
                passingScore={lesson.quiz.passingScore}
                questions={lesson.quiz.questions.map((q) => ({ id: q.id, text: q.text, options: q.options }))}
                nextHref={nextHref}
                courseHref={`/certificate/${course.id}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
