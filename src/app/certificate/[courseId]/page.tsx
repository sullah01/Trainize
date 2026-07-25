import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const certificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId: params.courseId } },
    include: { course: true, user: true },
  });

  if (!certificate) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
      <div className="w-full rounded-2xl border-4 border-brand-500 p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-500">Trainize</p>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Certificate of Completion</h1>
        <p className="mt-6 text-gray-500">This certifies that</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{certificate.user.name}</p>
        <p className="mt-4 text-gray-500">has successfully completed the course</p>
        <p className="mt-2 text-xl font-bold text-brand-600">{certificate.course.title}</p>
        <p className="mt-6 text-sm text-gray-400">
          Issued {certificate.issuedAt.toLocaleDateString()} · ID: {certificate.serial}
        </p>
      </div>

      <a
        href={`/api/certificate/${certificate.courseId}`}
        target="_blank"
        className="mt-8 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Download PDF
      </a>
    </div>
  );
}
