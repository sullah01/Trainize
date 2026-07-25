import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { quiz: { include: { questions: { orderBy: { order: "asc" } } } } },
          },
        },
      },
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, subtitle, description, level, hours, imageColor, categoryId, published } = body;

  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(subtitle !== undefined ? { subtitle } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(level !== undefined ? { level } : {}),
      ...(hours !== undefined ? { hours: Number(hours) } : {}),
      ...(imageColor !== undefined ? { imageColor } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
    },
  });

  return NextResponse.json({ course });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
