import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseEditor from "@/components/admin/CourseEditor";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user) redirect("/login");
  if (role !== "ADMIN") redirect("/dashboard");

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <CourseEditor courseId={course.id} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
