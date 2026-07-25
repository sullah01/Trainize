import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { passingScore, questions } = await req.json() as {
    passingScore: number;
    questions: { text: string; options: string[]; correctIndex: number }[];
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "At least one question is required" }, { status: 400 });
  }
  for (const q of questions) {
    if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
      return NextResponse.json({ error: "Each question needs text and at least 2 options" }, { status: 400 });
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return NextResponse.json({ error: "correctIndex out of range" }, { status: 400 });
    }
  }

  const quiz = await prisma.quiz.upsert({
    where: { lessonId: params.id },
    update: { passingScore: passingScore ? Number(passingScore) : 70 },
    create: { lessonId: params.id, passingScore: passingScore ? Number(passingScore) : 70 },
  });

  await prisma.question.deleteMany({ where: { quizId: quiz.id } });
  await prisma.question.createMany({
    data: questions.map((q, i) => ({
      quizId: quiz.id,
      order: i,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
    })),
  });

  const fullQuiz = await prisma.quiz.findUnique({
    where: { id: quiz.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ quiz: fullQuiz });
}
