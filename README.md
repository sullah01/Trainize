# Trainize

Trainize is a full-stack online learning platform — a functional take on the "free courses with
certificates" model (in the spirit of sites like Alison), built from scratch with its own branding,
codebase, and content. It's a Next.js 14 application with a PostgreSQL database, ready to run in
Docker.

## Features (v1)

- **Course catalog & browsing** — searchable, filterable by category
- **Lessons** — video and text lessons organized into modules
- **Quizzes** — auto-graded knowledge checks at the end of each module, with a passing threshold
- **Progress tracking** — per-lesson completion, per-course progress bar
- **Certificates** — auto-issued PDF certificate once every lesson in a course is completed,
  downloadable and viewable on a public-style certificate page
- **Accounts** — email/password signup & login (NextAuth, JWT sessions, bcrypt-hashed passwords)
- **Dashboard** — "My Learning" view of enrolled courses and certificates
- **Admin CMS** (`/admin`, ADMIN role only) — create/edit/delete courses, publish/unpublish, and
  manage modules, lessons (video/text/quiz), and quiz questions & answers through a UI — no direct
  database editing required

## Architecture

```
Browser
  │
  ▼
Next.js 14 (App Router)              ── src/app/**            UI (server components)
  ├─ Server Components               ── data fetched directly via Prisma
  ├─ Client Components               ── forms, quiz player, progress buttons
  └─ Route Handlers (API)            ── src/app/api/**         auth, enroll, progress, quiz, certs
        │
        ▼
Prisma ORM                            ── prisma/schema.prisma
        │
        ▼
PostgreSQL                            ── Dockerized `db` service
```

Key design choices:
- **Server Components by default** for data-heavy pages (catalog, course detail, dashboard) —
  no client-side data fetching / loading spinners needed for the main content.
- **Route Handlers** for all mutations (enroll, mark-lesson-complete, submit-quiz) so the same
  API could later be reused by a mobile client.
- **NextAuth (Credentials + JWT)** keeps auth self-contained with no external identity provider
  required, but is provider-agnostic if you want to add Google/GitHub login later.
- **Certificate generation** happens server-side with `pdf-lib` the moment the last lesson in a
  course is completed, and is served as a real downloadable PDF from an API route.

## Data model

`User → Enrollment → Course → Module → Lesson → Quiz → Question`, plus `LessonProgress`,
`QuizAttempt`, and `Certificate`. See `prisma/schema.prisma` for the full schema.

## Running locally with Docker (recommended)

This spins up Postgres, runs migrations + seeds demo data, then starts the app.

```bash
cp .env.example .env      # edit NEXTAUTH_SECRET for anything beyond local dev
docker compose up --build
```

App will be available at **http://localhost:3000**.

Demo student login: **demo@trainize.app** / **password123**
Demo admin login: **admin@trainize.app** / **password123** (visit `/admin` after logging in)

## Running locally without Docker

```bash
npm install
cp .env.example .env
# point DATABASE_URL at a local Postgres instance, e.g.:
# postgresql://trainize:trainize@localhost:5432/trainize?schema=public
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

## Project structure

```
src/
  app/
    page.tsx                  Landing page
    courses/                  Catalog + course detail
    learn/[slug]/[lessonId]/  Lesson player (video/text/quiz)
    dashboard/                "My Learning"
    certificate/[courseId]/   Certificate view
    login/ signup/            Auth pages
    api/                      Route handlers (auth, signup, enroll, progress, quiz, certificate)
  components/                 Reusable client + presentational components
  lib/                        prisma client, auth config, certificate PDF generator, completion logic
prisma/
  schema.prisma                Data model
  seed.ts                      Demo categories/courses/modules/lessons/quizzes
```

## Extending this into a full production product

Natural next steps, roughly in priority order:
1. **File/video storage** — swap the placeholder video URL for real uploads (S3 + a CDN)
2. **Payments** — if adding paid/premium courses, Stripe checkout + subscription entitlements
3. **Search** — swap the simple `LIKE` search for Postgres full-text search or Algolia/Meilisearch
4. **Notifications/email** — enrollment confirmations, completion emails (Resend/SendGrid)
5. **Observability** — structured logging, error tracking (Sentry), uptime checks
6. **CI/CD** — GitHub Actions to build/push the Docker image and run `prisma migrate deploy`
7. **Rate limiting & abuse protection** on auth, quiz-submission, and admin endpoints
8. **Drag-and-drop reordering** for modules/lessons in the admin editor (currently append-only order)
