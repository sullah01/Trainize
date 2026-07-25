import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildSampleCourses } from "./seedData";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (destructive reset)...");

  await prisma.certificate.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Demo Student", email: "demo@trainize.app", passwordHash, role: "STUDENT" },
  });
  await prisma.user.create({
    data: { name: "Trainize Admin", email: "admin@trainize.app", passwordHash, role: "ADMIN" },
  });

  await buildSampleCourses(prisma);

  console.log("Seed complete. Demo login: demo@trainize.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
