import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../schema';
import { seedSuperAdmin } from './super-admin.seeder';
import { seedBotConfiguration } from './bot-configuration.seeder';


export async function runMainSeeder(db: NeonHttpDatabase<typeof schema>): Promise<void> {
  console.log('\n🌱 Memulai proses seeding database...');

  
  await seedSuperAdmin(db);

  
  await seedBotConfiguration(db);

  console.log('\n✅ Seeding database selesai dengan sukses!\n');
}
