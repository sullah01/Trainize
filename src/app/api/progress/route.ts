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

  const { lessonId } = await req.json();
  if (!lessonId) {
    return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true },
    create: { userId, lessonId, completed: true },
  });

  const certificate = await checkAndIssueCertificate(userId, lesson.module.courseId);

  return NextResponse.json({ ok: true, courseCompleted: !!certificate });
}
