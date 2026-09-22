# Berufly

A platform connecting international students and candidates, German companies, educators, and Berufly
administrators — jobs and Ausbildung positions, German-language and professional training, company training
requests, and free integration guidance. Starting in Berlin & Brandenburg.

This is a real, deployable Next.js app (App Router) backed by PostgreSQL via Prisma, with NextAuth for
email+password and Google sign-in. It was built from a working prototype and mirrors its data model and
workflows.

**Important**: this codebase was written without a network connection and has not been run, built, or
type-checked in a live environment. Treat the first `npm install && npm run build` as the real test — if
something doesn't compile, that's expected on a first pass for a project this size, and each error should be a
quick, mechanical fix (a typo, an import, a Prisma field name). Come back with the exact error and it'll get
fixed.

## Stack

- **Next.js 14** (App Router, Server Actions — most forms submit directly to server-side functions, no separate
  API layer needed for CRUD)
- **PostgreSQL + Prisma** — see `prisma/schema.prisma` for the full data model
- **NextAuth** — Credentials (email + bcrypt-hashed password) and Google OAuth, JWT sessions
- **Tailwind CSS** — same color/type tokens as the original prototype
- **Local disk storage** for CV uploads, under a path meant to be a Railway Volume (see below). Swap for S3 /
  Cloudflare R2 later if you outgrow a single volume — `src/lib/storage.ts` is the one file to change.

## Project structure

```
prisma/schema.prisma       All data models (User, CandidateProfile, Company, Vacancy, Application,
                           EducatorProfile, Course, CourseEnrollment, TrainingRequest, GuidanceRequest, ...)
prisma/seed.ts             Creates the first ADMIN account
src/lib/auth.ts            NextAuth config (Credentials + Google)
src/lib/authz.ts           requireSession() / requireRole() guards used at the top of every protected page
src/lib/match.ts           The explainable matching engine (candidate vs. vacancy)
src/lib/storage.ts         CV upload storage (local disk / Railway Volume)
src/lib/actions/*.ts       Server Actions — one file per domain (candidate, company, vacancy, application,
                           educator, course, trainingRequest, guidance, admin, onboarding)
src/app/                   Pages, one route per folder (App Router)
src/components/            Shared UI (Nav, Footer, form fields, review controls, Vacancy/Course forms)
```

## Local setup

1. **Install Node 18.18+** and Postgres (or use Railway's Postgres from day one — see below).
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `NEXTAUTH_SECRET` (generate with
   `openssl rand -base64 32`), and `NEXTAUTH_URL=http://localhost:3000`. Google OAuth vars can stay empty
   locally if you only want to test email/password.
4. `npx prisma migrate dev --name init` — creates all tables.
5. Set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`, then `npm run db:seed` to create your first admin
   login.
6. `npm run dev` — open http://localhost:3000.

## Deploying to Railway

1. **Create a new Railway project** from this repo (push it to GitHub first, then "Deploy from GitHub repo" in
   Railway, or use the Railway CLI: `railway init` then `railway up` from this folder).
2. **Add a PostgreSQL plugin** to the same project (Railway dashboard → "+ New" → "Database" → "PostgreSQL").
   Railway gives it a `DATABASE_URL` reference variable automatically.
3. **On your app service → Variables**, add:
   - `DATABASE_URL` → reference the Postgres plugin's variable (Railway lets you pick
     `${{Postgres.DATABASE_URL}}` from a dropdown)
   - `NEXTAUTH_SECRET` → a random 32-byte value
   - `NEXTAUTH_URL` → your Railway-provided domain, e.g. `https://berufly.up.railway.app` (update this if you
     later attach a custom domain)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → from Google Cloud Console (see `.env.example` for the
     redirect URI to register: `<NEXTAUTH_URL>/api/auth/callback/google`)
   - `UPLOAD_DIR` → `/data/uploads`
4. **Add a Volume**: app service → "Volumes" → new volume → mount path `/data`. This is what makes uploaded
   CVs survive redeploys — without it, `/data` is wiped on every deploy.
5. **Build & start commands** (Railway usually detects these from `package.json`, but set them explicitly under
   Settings if not):
   - Build: `npm run build` (this also runs `prisma generate` via the `postinstall`/`build` script)
   - Start: `npm run start`
6. **Run the first migration against the production database.** Easiest path: install the Railway CLI
   (`npm i -g @railway/cli`), `railway login`, `railway link` to this project, then:
   ```
   railway run npm run db:migrate
   railway run npm run db:seed
   ```
   (`db:migrate` runs `prisma migrate deploy`, which applies committed migrations without prompting — the
   right command for production. `db:seed` needs `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` set as Railway
   variables first, even if only temporarily.)
7. Every future push runs `npm run build` automatically; run `railway run npm run db:migrate` again after any
   schema change (`npx prisma migrate dev --name <change>` locally first, commit the generated
   `prisma/migrations/` folder, then deploy and run migrate on Railway).

## Promoting more admins

There's no self-service admin signup (by design — see `src/lib/actions/onboarding.ts`). To make someone else an
admin, run against the production database (`railway run npx prisma studio`, or a one-off script like
`prisma/seed.ts`):

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'someone@example.com';
```

## What's carried over from the prototype, and what's genuinely new here

- **Real password auth + Google sign-in**, not "whoever has the link" — a proper `User` table with hashed
  passwords.
- **A real relational schema** — Postgres via Prisma instead of a generic per-artifact document store, so this
  can scale, be queried, backed up, and migrated like a normal production database.
- **The same explainable matching engine, approval workflow, and page structure** as the prototype (landing →
  onboarding → role dashboards → admin console), rewritten as Next.js pages and Server Actions.
- **Not yet ported**: some prototype conveniences like inline JS toasts were simplified to redirect + banner
  messages (`?ok=`/`?err=` query params) to keep the Server Actions simple. Re-adding optimistic client-side
  toasts is a reasonable follow-up once the core is verified working.

## Known things to double-check on first run

- Prisma's `Json` fields (`Application.statusHistory`) are written with `as any` casts in a couple of actions
  to satisfy TypeScript without importing `Prisma.JsonArray` — functionally fine, but tighten the typing if you
  want.
- The Credentials + Google combination requires JWT sessions (not database sessions) — this is already
  configured in `src/lib/auth.ts`, but if you ever add another OAuth provider, keep `session.strategy: 'jwt'`.
- File uploads go through a custom `/api/uploads/[...path]` route reading from disk — there's no access control
  on it beyond an unguessable filename. Tighten this if CVs need to stay private to the company that received an
  application.
