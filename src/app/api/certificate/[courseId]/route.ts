import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/certificate";

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const certificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId: params.courseId } },
    include: { course: true, user: true },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const pdfBytes = await generateCertificatePdf({
    studentName: certificate.user.name,
    courseTitle: certificate.course.title,
    issuedAt: certificate.issuedAt,
    serial: certificate.serial,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="trainize-certificate-${certificate.serial}.pdf"`,
    },
  });
}
