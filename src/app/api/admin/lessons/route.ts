import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { moduleId, title, type, content, videoUrl, durationMin } = await req.json();
  if (!moduleId || !title || !type) {
    return NextResponse.json({ error: "moduleId, title and type are required" }, { status: 400 });
  }
  if (!["VIDEO", "TEXT", "QUIZ"].includes(type)) {
    return NextResponse.json({ error: "Invalid lesson type" }, { status: 400 });
  }

  const count = await prisma.lesson.count({ where: { moduleId } });
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      type,
      order: count,
      content: content || "",
      videoUrl: videoUrl || null,
      durationMin: durationMin ? Number(durationMin) : 5,
    },
  });

  if (type === "QUIZ") {
    await prisma.quiz.create({ data: { lessonId: lesson.id, passingScore: 70 } });
  }

  return NextResponse.json({ lesson });
}
