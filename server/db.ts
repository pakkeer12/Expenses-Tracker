import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we're using PostgreSQL or SQLite
const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

let db: ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzlePostgres>;
let sqlite: Database.Database | null = null;

if (DATABASE_URL) {
  // Use PostgreSQL for production (Render, Railway, etc.)
  console.log('🐘 Using PostgreSQL database');
  const queryClient = postgres(DATABASE_URL);
  db = drizzlePostgres(queryClient, { schema });
} else {
  // Use SQLite for local development
  console.log('💾 Using SQLite database (local.db)');
  const dbPath = path.join(__dirname, '..', 'local.db');
  sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema });
}

export { db, sqlite };

