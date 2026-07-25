import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, order } = await req.json();
  const module = await prisma.module.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(order !== undefined ? { order: Number(order) } : {}),
    },
  });
  return NextResponse.json({ module });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.module.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
