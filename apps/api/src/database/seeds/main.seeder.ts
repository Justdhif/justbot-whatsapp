import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../schema';
import { seedSuperAdmin } from './super-admin.seeder';
import { seedBotConfiguration } from './bot-configuration.seeder';

/**
 * Main Database Seeder (seperti DatabaseSeeder di Laravel)
 * Tempat mendaftarkan dan menjalankan semua file seeder secara berurutan.
 */
export async function runMainSeeder(db: NeonHttpDatabase<typeof schema>): Promise<void> {
  console.log('\n🌱 Memulai proses seeding database...');

  // 1. Jalankan Super Admin Seeder
  await seedSuperAdmin(db);

  // 2. Jalankan Bot Configuration Seeder
  await seedBotConfiguration(db);

  console.log('\n✅ Seeding database selesai dengan sukses!\n');
}
