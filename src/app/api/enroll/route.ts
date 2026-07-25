import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });

  return NextResponse.json({ ok: true, enrollment });
}
