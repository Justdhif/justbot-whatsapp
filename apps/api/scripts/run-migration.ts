import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in env');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('🚀 Running manual migration: CREATE TABLE otps...');

  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS "otps" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "phone_number" varchar(20) NOT NULL,
        "code" varchar(6) NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Table "otps" created or already exists!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
