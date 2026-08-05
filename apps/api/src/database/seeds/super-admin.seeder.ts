import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as schema from '../schema';
import { users, userProfiles, botConfigurations } from '../schema';

export async function seedSuperAdmin(db: NeonHttpDatabase<any>): Promise<void> {
  console.log('   🔑 Running Super Admin Seeder...');

  const adminEmail = 'superadmin@justbot.com';
  const adminPhone = '628123456789';
  const adminPassword = 'SuperAdmin123!';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  // 1. Cek / Insert Super Admin
  let userId: string;
  const existingResult = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);
  const existing = existingResult[0] ?? null;

  if (existing) {
    userId = existing.id;
    console.log(`      ⚠  User Super Admin (${adminEmail}) sudah terdaftar.`);
    
    // Update password, role, & isActive just in case
    await db.update(users)
      .set({
        passwordHash,
        role: 'super_admin',
        isActive: true,
      })
      .where(eq(users.id, userId));
    console.log('      ✓ Password & role Super Admin berhasil diperbarui.');
  } else {
    const insertRes = await db.insert(users)
      .values({
        phoneNumber: adminPhone,
        email: adminEmail,
        passwordHash,
        role: 'super_admin',
        isActive: true,
      })
      .returning();
    userId = insertRes[0].id;
    console.log('      ✓ User Super Admin berhasil ditambahkan.');

    // Insert profile
    await db.insert(userProfiles)
      .values({
        userId,
        displayName: 'Super Admin',
        timezone: 'Asia/Jakarta',
        language: 'id',
      });
    console.log('      ✓ Profile Super Admin berhasil dibuat.');
  }

  // 2. Inisialisasi default row di bot_configurations jika kosong
  const configResult = await db
    .select()
    .from(botConfigurations)
    .limit(1);
  const config = configResult[0] ?? null;

  if (!config) {
    await db.insert(botConfigurations)
      .values({
        updatedBy: userId,
      });
    console.log('      ✓ Baris konfigurasi default bot berhasil diinisialisasi.');
  } else {
    console.log('      ✓ Konfigurasi default bot sudah ada.');
  }

  console.log('      ─────────────────────────────────────────────');
  console.log(`      📧 Email    : ${adminEmail}`);
  console.log(`      📱 Nomor WA : ${adminPhone}`);
  console.log(`      🔑 Password : ${adminPassword}`);
  console.log('      ─────────────────────────────────────────────');
}
