import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndIssueCertificate } from "@/lib/completion";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const { quizId, answers } = await req.json() as { quizId: string; answers: Record<string, number> };
  if (!quizId || !answers) {
    return NextResponse.json({ error: "Missing quizId or answers" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true, lesson: { include: { module: true } } },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  let correct = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctIndex) correct++;
  }
  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: { userId, quizId, score, passed },
  });

  let courseCompleted = false;
  if (passed) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: quiz.lessonId } },
      update: { completed: true },
      create: { userId, lessonId: quiz.lessonId, completed: true },
    });
    const certificate = await checkAndIssueCertificate(userId, quiz.lesson.module.courseId);
    courseCompleted = !!certificate;
  }

  return NextResponse.json({ score, passed, courseCompleted, correctCount: correct, total: quiz.questions.length });
}
