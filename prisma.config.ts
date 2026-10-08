import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Optional here so that `prisma generate` also works without a database
    // (Vercel preview builds, CI). Commands that use the DB fail clearly without it.
    url: process.env.DATABASE_URL,
  },
});
