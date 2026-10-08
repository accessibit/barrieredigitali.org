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
npm run db:seed      # example data: real public services (local only)
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

- Skip link, landmarks, `aria-current` in the menus, focus moved to the heading after every navigation, and back to the service you came from when returning to the list (same search, sort and page).
- List, detail and form are **blocking routes** (`export const instant = false`): the server sends complete HTML, so search, sorting, pagination and the form work **without JavaScript**, with no layout shift.
  - Without JavaScript, the form uses Post/Redirect/Get with a 60-second cookie. Cache Components does not pass `useActionState` state to the HTML in that case.
- Form: an error summary that receives focus, inline errors linked through `aria-describedby`, and a page title prefixed with "Errori nel modulo".
- Links in body text are underlined. Contrast ratios are noted next to the tokens. Touch targets are at least 44px. Layout is fluid down to 320px, using a container query at 760px.

## Tests

- `npm test`: Vitest + Testing Library + axe-core (normalisation, pagination, validation, components).
- `npm run test:e2e`: Playwright on desktop (1440px) and mobile (390px), against the local seed (`npm run db:seed`). Expected values are derived from `prisma/seed-data.ts`.
  - **Accessibility:** axe WCAG 2.2 AA on every page and state, visible focus, touch targets, and reflow at 320px.
  - **Navigation:** menu, footer, skip link, back/forward and 404 pages.
  - **List:** live search, Enter, clear, sorting, pagination, returning from the detail page, and the no-JavaScript flow.
  - **Detail:** counts, report pagination and pre-filled form link.
  - **Form:** every type, every error, summary links, successful submission (checked in the database), "Invia un'altra", the honeypot, and no-JavaScript submission.
  - **Metadata:** icons, Open Graph image, sitemap, security headers, and the www redirect.
- Reports created by the tests (`e2e-*`) are deleted at the end.

## Deploy (Vercel)

- Functions run in `fra1` (Frankfurt), next to the database.
- **Database:** Amazon Aurora PostgreSQL connected through the Vercel Marketplace (integration `aws/aws-apg`), on the production environment only. There is no password: the app signs a 15-minute IAM token with the project's OIDC credentials (`src/lib/db-connection.ts`), over TLS verified with the RDS CA. The variables (`PGHOST`, `PGUSER`, `AWS_ROLE_ARN`, …) are set by the integration.
- **Migrations:** `vercel-build` applies them (`scripts/migrate.ts`, which signs a token and runs `prisma migrate deploy`) only on production builds; previews do not touch the database. Never run the seed in production.
- **Locally:** `DATABASE_URL` points to the Postgres in Docker.
- `SITE_URL`: `https://barrieredigitali.org`.
