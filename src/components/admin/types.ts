export type QuestionFull = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export type QuizFull = {
  id: string;
  passingScore: number;
  questions: QuestionFull[];
};

export type LessonFull = {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ";
  order: number;
  content: string;
  videoUrl: string | null;
  durationMin: number;
  quiz: QuizFull | null;
};

export type ModuleFull = {
  id: string;
  title: string;
  order: number;
  lessons: LessonFull[];
};

export type CourseFull = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  hours: number;
  imageColor: string;
  categoryId: string;
  published: boolean;
  modules: ModuleFull[];
};
