import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from '../src/database/schema';
import { runMainSeeder } from '../src/database/seeds/main.seeder';

dotenv.config();

async function startSeeding(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  try {
    await runMainSeeder(db);
  } catch (err: any) {
    console.error('❌ Seeding database gagal:', err.message);
    process.exit(1);
  }
}

startSeeding();
