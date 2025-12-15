import postgres from 'postgres';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Running migration...');
    const migrationSQL = readFileSync('./migrations/0003_add_loan_emi_fields.sql', 'utf-8');
    await sql.unsafe(migrationSQL);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
