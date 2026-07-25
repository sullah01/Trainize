import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PublishToggle from "@/components/admin/PublishToggle";
import DeleteCourseButton from "@/components/admin/DeleteCourseButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user) redirect("/login");
  if (role !== "ADMIN") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    include: { category: true, modules: { include: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin · Courses</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New course
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Lessons</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
              return (
                <tr key={course.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-800">{course.title}</td>
                  <td className="px-4 py-3 text-gray-500">{course.category.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {course.modules.length} modules · {lessonCount} lessons
                  </td>
                  <td className="px-4 py-3">
                    <PublishToggle courseId={course.id} published={course.published} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/courses/${course.id}`} className="font-semibold text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No courses yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
