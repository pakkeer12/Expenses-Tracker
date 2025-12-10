import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SQLite database file in the project root
const dbPath = path.join(__dirname, '..', 'local.db');
console.log('💾 Using SQLite database:', dbPath);

export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });


