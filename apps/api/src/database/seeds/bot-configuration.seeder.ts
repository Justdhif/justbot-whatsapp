import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { botConfigurations, users } from '../schema';
import { eq } from 'drizzle-orm';

export async function seedBotConfiguration(db: NeonHttpDatabase<any>): Promise<void> {
  console.log('   ⚙️ Running Bot Configuration Seeder...');

  // 1. Dapatkan super admin ID untuk kolom updatedBy
  const adminEmail = 'superadmin@justbot.com';
  const existingResult = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);
  const admin = existingResult[0] ?? null;
  const adminId = admin ? admin.id : null;

  // 2. Inisialisasi default row di bot_configurations jika kosong
  const configResult = await db
    .select()
    .from(botConfigurations)
    .limit(1);
  const config = configResult[0] ?? null;

  if (!config) {
    await db.insert(botConfigurations)
      .values({
        updatedBy: adminId,
      });
    console.log('      ✓ Baris konfigurasi default bot berhasil diinisialisasi.');
  } else {
    console.log('      ✓ Konfigurasi default bot sudah ada.');
  }
}
