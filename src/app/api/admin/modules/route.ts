import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId, title } = await req.json();
  if (!courseId || !title) {
    return NextResponse.json({ error: "courseId and title are required" }, { status: 400 });
  }

  const count = await prisma.module.count({ where: { courseId } });
  const module = await prisma.module.create({
    data: { courseId, title, order: count },
  });

  return NextResponse.json({ module });
}
