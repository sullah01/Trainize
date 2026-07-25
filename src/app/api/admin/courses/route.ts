import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const courses = await prisma.course.findMany({
    include: { category: true, modules: { include: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, subtitle, description, level, hours, imageColor, categoryId } = body;

  if (!title || !categoryId) {
    return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
  }

  const baseSlug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = baseSlug;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      subtitle: subtitle || "",
      description: description || "",
      level: level || "Beginner",
      hours: hours ? Number(hours) : 1,
      imageColor: imageColor || "#6D5BD0",
      categoryId,
      published: false,
    },
  });

  return NextResponse.json({ course });
}
