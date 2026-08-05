import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('\n🚀 Menjalankan migrasi manual untuk bot_activity_logs...\n');

  try {
    // 1. Create Types
    try {
      await sql(`CREATE TYPE "public"."log_direction" AS ENUM('incoming', 'outgoing')`);
      console.log('   ✓ Type log_direction created.');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('   ℹ Type log_direction already exists, skipping.');
      } else {
        throw e;
      }
    }

    try {
      await sql(`CREATE TYPE "public"."log_status" AS ENUM('success', 'failed', 'ignored')`);
      console.log('   ✓ Type log_status created.');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('   ℹ Type log_status already exists, skipping.');
      } else {
        throw e;
      }
    }

    // 2. Create Table
    try {
      await sql(`
        CREATE TABLE IF NOT EXISTS "bot_activity_logs" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL,
          "sender_number" varchar(20) NOT NULL,
          "sender_name" varchar(100),
          "message_text" text NOT NULL,
          "direction" "log_direction" NOT NULL,
          "module_used" varchar(50),
          "status" "log_status" DEFAULT 'success' NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        )
      `);
      console.log('   ✓ Table bot_activity_logs created.');
    } catch (e: any) {
      throw e;
    }

    // 3. Add FK Constraint
    try {
      await sql(`
        ALTER TABLE "bot_activity_logs" 
        ADD CONSTRAINT "bot_activity_logs_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE cascade ON UPDATE no action
      `);
      console.log('   ✓ Foreign key constraint added.');
    } catch (e: any) {
      if (e.message.includes('already exists') || e.message.includes('relation "bot_activity_logs_user_id_users_id_fk" already exists')) {
        console.log('   ℹ Foreign key constraint already exists, skipping.');
      } else {
        throw e;
      }
    }

    console.log('\n✅ Migrasi berhasil diselesaikan.');
  } catch (err: any) {
    console.error('❌ Migrasi gagal:', err.message);
    process.exit(1);
  }
}

runMigration();
