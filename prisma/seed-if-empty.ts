import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildSampleCourses } from "./seedData";

const prisma = new PrismaClient();

async function main() {
  const courseCount = await prisma.course.count();
  if (courseCount > 0) {
    console.log("Courses already exist — skipping sample data setup.");
    return;
  }

  console.log("No courses found — creating demo accounts and sample courses...");

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "demo@trainize.app" },
    update: {},
    create: { name: "Demo Student", email: "demo@trainize.app", passwordHash, role: "STUDENT" },
  });
  await prisma.user.upsert({
    where: { email: "admin@trainize.app" },
    update: {},
    create: { name: "Trainize Admin", email: "admin@trainize.app", passwordHash, role: "ADMIN" },
  });

  await buildSampleCourses(prisma);

  console.log("Setup complete. Demo login: demo@trainize.app / password123");
}

main()
  .catch((e) => {
    // Log but don't crash the container's startup over a seeding hiccup —
    // the app should still come up even if sample-data setup has an issue.
    console.error("Seed-if-empty step failed (continuing anyway):", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
