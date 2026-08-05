import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as schema from '../schema';
import { users, userProfiles, botConfigurations } from '../schema';

export async function seedSuperAdmin(db: NeonHttpDatabase<typeof schema>): Promise<void> {
  console.log('   🔑 Running Super Admin Seeder...');

  const adminEmail = 'superadmin@justbot.com';
  const adminPhone = '628123456789';
  const adminPassword = 'SuperAdmin123!';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  // 1. Cek / Insert Super Admin
  let userId: string;
  const existing = await db.query.users.findFirst({
    where: (u, { eq: eqFn }) => eqFn(u.email, adminEmail),
  });

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
  const config = await db.query.botConfigurations.findFirst();
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
