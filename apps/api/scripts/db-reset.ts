/**
 * db-reset.ts
 *
 * Skrip untuk menghapus seluruh data dan tabel di database Neon,
 * mirip dengan `php artisan migrate:fresh` di Laravel.
 *
 * PERINGATAN: Ini akan menghapus SEMUA DATA secara permanen!
 *
 * Cara pakai:
 *   npm run db:reset
 *
 * Yang dilakukan:
 *   1. Drop semua tabel app (CASCADE untuk handle FK)
 *   2. Drop custom enum types
 *   3. Jalankan `drizzle-kit push` untuk buat ulang schema
 */
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('\n🗑️  Menghapus semua tabel...\n');

  // Drop tables secara berurutan (child tables dulu untuk avoid FK conflict)
  const tables = ['reminders', 'transactions', 'user_profiles', 'users'];

  for (const table of tables) {
    await sql(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`   ✓ Dropped table: ${table}`);
  }

  // Drop custom enum types
  const enumTypes = ['transaction_type'];
  for (const enumType of enumTypes) {
    await sql(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
    console.log(`   ✓ Dropped type: ${enumType}`);
  }

  console.log('\n✅ Database berhasil direset. Semua tabel dan tipe dihapus.');
  console.log('🔄 Menjalankan schema push ke Neon...\n');
}

resetDatabase().catch((err: unknown) => {
  console.error('❌ Reset gagal:', err);
  process.exit(1);
});
