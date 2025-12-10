import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';

dotenv.config();

// Use PostgreSQL if DATABASE_URL is set, otherwise use SQLite
const DATABASE_URL = process.env.DATABASE_URL;

export default DATABASE_URL
  ? defineConfig({
      out: "./migrations",
      schema: "./shared/schema.ts",
      dialect: "postgresql",
      dbCredentials: {
        url: DATABASE_URL,
      },
    })
  : defineConfig({
      out: "./migrations",
      schema: "./shared/schema.ts",
      dialect: "sqlite",
      dbCredentials: {
        url: "./local.db",
      },
    });

