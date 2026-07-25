import { prisma } from "./prisma";
import { randomBytes } from "crypto";

export async function checkAndIssueCertificate(userId: string, courseId: string) {
  const allLessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });
  if (allLessons.length === 0) return null;

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, completed: true, lessonId: { in: allLessons.map((l) => l.id) } },
    select: { lessonId: true },
  });

  const allDone = allLessons.every((l) => completed.some((c) => c.lessonId === l.id));
  if (!allDone) return null;

  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: { completedAt: new Date() },
  });

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  const serial = `TZ-${randomBytes(4).toString("hex").toUpperCase()}`;
  return prisma.certificate.create({
    data: { userId, courseId, serial },
  });
}
