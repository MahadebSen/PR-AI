import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback allows `prisma generate` without a live DB; migrations need DATABASE_URL.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/pr_ai",
  },
});
