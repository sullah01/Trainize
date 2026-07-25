import { PrismaClient, LessonType } from "@prisma/client";

export const CATEGORY_NAMES = ["Business", "Technology", "Health & Wellbeing", "Personal Development", "Language"];

export const COURSE_DEFS = [
  {
    title: "Diploma in Digital Marketing",
    subtitle: "Master SEO, social media, and content marketing fundamentals",
    description:
      "A comprehensive introduction to digital marketing covering search engine optimization, social media strategy, email marketing, and analytics. Designed for beginners who want a practical, job-ready skillset.",
    level: "Beginner",
    hours: 6,
    imageColor: "#6D5BD0",
    category: "Business",
  },
  {
    title: "Certificate in Workplace Communication",
    subtitle: "Build confident, clear communication skills for any workplace",
    description:
      "Learn the principles of effective workplace communication, including active listening, written communication, presentations, and conflict resolution.",
    level: "Beginner",
    hours: 3,
    imageColor: "#1E9E8C",
    category: "Personal Development",
  },
  {
    title: "Diploma in Web Development Fundamentals",
    subtitle: "HTML, CSS, and JavaScript basics for aspiring developers",
    description:
      "Get hands-on with the building blocks of the web. This course walks through HTML structure, CSS styling, and JavaScript interactivity with practical examples.",
    level: "Beginner",
    hours: 8,
    imageColor: "#2563EB",
    category: "Technology",
  },
  {
    title: "Certificate in Mental Health Awareness",
    subtitle: "Understand mental health, stress, and wellbeing at work",
    description:
      "An accessible introduction to mental health awareness, covering common conditions, stress management techniques, and how to support colleagues and yourself.",
    level: "Beginner",
    hours: 2,
    imageColor: "#E0855A",
    category: "Health & Wellbeing",
  },
  {
    title: "Diploma in Project Management",
    subtitle: "Plan, execute, and deliver projects with confidence",
    description:
      "Covers the full project lifecycle: initiation, planning, execution, monitoring, and closure, along with common frameworks like Agile and Waterfall.",
    level: "Intermediate",
    hours: 5,
    imageColor: "#B0479A",
    category: "Business",
  },
  {
    title: "Certificate in Business English",
    subtitle: "Improve your professional English for the workplace",
    description:
      "Focused on the vocabulary, grammar, and etiquette needed for professional emails, meetings, and presentations in English.",
    level: "Beginner",
    hours: 4,
    imageColor: "#3FA34D",
    category: "Language",
  },
];

export async function buildSampleCourses(prisma: PrismaClient) {
  const categories = await Promise.all(
    CATEGORY_NAMES.map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        update: {},
        create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      })
    )
  );

  for (const def of COURSE_DEFS) {
    const category = categories.find((c) => c.name === def.category)!;
    const slug = def.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const course = await prisma.course.create({
      data: {
        slug,
        title: def.title,
        subtitle: def.subtitle,
        description: def.description,
        level: def.level,
        hours: def.hours,
        imageColor: def.imageColor,
        categoryId: category.id,
      },
    });

    const moduleTitles = ["Introduction", "Core Concepts", "Practical Application"];
    for (let m = 0; m < moduleTitles.length; m++) {
      const module = await prisma.module.create({
        data: { title: moduleTitles[m], order: m, courseId: course.id },
      });

      for (let l = 0; l < 2; l++) {
        await prisma.lesson.create({
          data: {
            title: `${moduleTitles[m]} - Lesson ${l + 1}`,
            type: l === 0 ? LessonType.VIDEO : LessonType.TEXT,
            order: l,
            durationMin: l === 0 ? 8 : 6,
            videoUrl:
              l === 0
                ? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                : null,
            content:
              l === 0
                ? "Watch the video above, then continue to the next lesson."
                : `This lesson covers key ideas within "${moduleTitles[m]}" for the course "${def.title}". ` +
                  "In a full build this would contain rich text, images, and downloadable resources.",
            moduleId: module.id,
          },
        });
      }

      const quizLesson = await prisma.lesson.create({
        data: {
          title: `${moduleTitles[m]} - Knowledge Check`,
          type: LessonType.QUIZ,
          order: 2,
          durationMin: 5,
          content: "Answer the questions below to complete this module.",
          moduleId: module.id,
        },
      });

      const quiz = await prisma.quiz.create({
        data: { lessonId: quizLesson.id, passingScore: 70 },
      });

      await prisma.question.createMany({
        data: [
          {
            quizId: quiz.id,
            order: 0,
            text: `Which of the following best relates to "${moduleTitles[m]}" in this course?`,
            options: ["A relevant core concept", "An unrelated topic", "None of the above", "All courses are identical"],
            correctIndex: 0,
          },
          {
            quizId: quiz.id,
            order: 1,
            text: "What is the recommended way to complete this course?",
            options: ["Skip all lessons", "Work through lessons and quizzes in order", "Only watch videos", "Only read text lessons"],
            correctIndex: 1,
          },
        ],
      });
    }
  }
}
