import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewCourseForm from "@/components/admin/NewCourseForm";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user) redirect("/login");
  if (role !== "ADMIN") redirect("/dashboard");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">New course</h1>
      <p className="mt-1 text-sm text-gray-500">
        Start with the basics — you'll add modules, lessons, and quizzes on the next screen.
      </p>
      <NewCourseForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
