# Barriere Digitali

Le barriere del web, segnalate da chi le incontra. A public directory of reports about inaccessible websites, apps and digital documents, moderated before publication.

The design comes from `Barriere Digitali.html` (a bundled design export).

## Stack

- **Next.js 16** (App Router, Cache Components, Turbopack, `typedRoutes`), React 19, TypeScript 6
- **Tailwind CSS 4**, CSS-first, with the tokens in `src/app/globals.css`
- **Prisma 7** + PostgreSQL (`@prisma/adapter-pg`); the client is generated into `src/generated/prisma`
- **zod** for validating the report form (server action)
- **Prettier** (plugins for Tailwind and Prisma), **ESLint** (`next` + full `jsx-a11y` + `prettier`)
- **Vitest** + Testing Library + **axe-core**; **Playwright** + **@axe-core/playwright**
- husky + lint-staged + commitlint (Conventional Commits)

## Local development

Requirements: Node 22.22+ (`nvm use`), Docker.

```bash
npm install
cp .env.example .env
npm run db:up        # Postgres on localhost:5433
npm run db:migrate   # applies the migrations
npm run db:seed      # demo data (local only)
npm run dev
```

The seed (`prisma/seed.ts`) **refuses to run** if `DATABASE_URL` does not point to a local database, or if `NODE_ENV=production` or `VERCEL` is set.

## Scripts

| Command               | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Development server                                   |
| `npm run build`       | `prisma generate` + production build                 |
| `npm run lint`        | ESLint (includes the accessibility rules)            |
| `npm run check-types` | Route type generation + `tsc`                        |
| `npm run format`      | Prettier                                             |
| `npm test`            | Unit and component tests (Vitest + axe-core)         |
| `npm run test:e2e`    | Playwright: axe WCAG 2.2 AA, keyboard, focus, reflow |
| `npm run db:studio`   | Prisma Studio (moderation)                           |
| `npm run db:deploy`   | Applies the migrations in production                 |

## Moderation

Reports arrive with `status = PENDING` and no linked service. To publish one, open `npm run db:studio` (pointed at the right database) and:

1. Create the `Service` if it does not exist yet. You need `slug`, `name`, `kind`, and `nameNormalized`, which is the name in lowercase without `https://` or `www.`.
2. On the `Report`, set `serviceId`, `status = PUBLISHED` and `publishedAt` (the date shown to the public). Remove any personal data from `description` first.

Counts and dates in the list are computed from published reports, so nothing else needs updating.

## Accessibility

- Skip link, landmarks, `aria-current` in the menus, focus moved to the heading after every navigation.
- The search and the form also work without JavaScript. Search results are announced with `role="status"`.
- Form: an error summary that receives focus, inline errors linked through `aria-describedby`, and a page title prefixed with "Errori nel modulo".
- Contrast ratios are noted next to the tokens. Touch targets are at least 44px. Layout is fluid down to 320px, using a container query at 760px.
- The e2e tests (`e2e/a11y.spec.ts`) run axe on every page and state, at 1440px and 390px.

## Deploy (Vercel)

Required environment variables: `DATABASE_URL` (production Postgres) and `SITE_URL` (`https://barrieredigitali.org`). Migrations are applied with `npm run db:deploy`; never run the seed in production.
