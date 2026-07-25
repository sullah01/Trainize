import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, videoUrl, durationMin, order } = await req.json();
  const lesson = await prisma.lesson.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(videoUrl !== undefined ? { videoUrl } : {}),
      ...(durationMin !== undefined ? { durationMin: Number(durationMin) } : {}),
      ...(order !== undefined ? { order: Number(order) } : {}),
    },
  });
  return NextResponse.json({ lesson });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
