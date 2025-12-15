import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// PostgreSQL database connection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('💾 Connecting to PostgreSQL database');

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema, logger: true });


