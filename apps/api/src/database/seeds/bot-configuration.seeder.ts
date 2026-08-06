import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { botConfigurations, users } from '../schema';
import { eq } from 'drizzle-orm';

export async function seedBotConfiguration(db: NeonHttpDatabase<any>): Promise<void> {
  console.log('   ⚙️ Running Bot Configuration Seeder...');

  
  const adminEmail = 'superadmin@justbot.com';
  const existingResult = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);
  const admin = existingResult[0] ?? null;
  const adminId = admin ? admin.id : null;

  
  const configResult = await db
    .select()
    .from(botConfigurations)
    .limit(1);
  const config = configResult[0] ?? null;

  if (!config) {
    await db.insert(botConfigurations)
      .values({
        effectiveDays: [1, 2, 3, 4, 5],
        effectiveHourStart: '08:00',
        effectiveHourEnd: '17:00',
        isMaintenance: false,
        timezone: 'Asia/Jakarta',
        updatedBy: adminId,
      });
    console.log('      ✓ Baris konfigurasi default bot berhasil diinisialisasi.');
  } else {
    console.log('      ✓ Konfigurasi default bot sudah ada.');
  }
}
