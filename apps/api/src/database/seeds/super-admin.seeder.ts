import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as schema from '../schema';
import { users, userProfiles } from '../schema';

export async function seedSuperAdmin(db: NeonHttpDatabase<any>): Promise<void> {
  const adminEmail = 'superadmin@justbot.com';
  const adminPhone = '628123456789';
  const adminPassword = 'SuperAdmin123!';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  
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

    
    await db.insert(userProfiles)
      .values({
        userId,
        displayName: 'Super Admin',
        timezone: 'Asia/Jakarta',
        language: 'id',
      });
    console.log('      ✓ Profile Super Admin berhasil dibuat.');
  }

  console.log('      ─────────────────────────────────────────────');
  console.log(`      📧 Email    : ${adminEmail}`);
  console.log(`      📱 Nomor WA : ${adminPhone}`);
  console.log(`      🔑 Password : ${adminPassword}`);
  console.log('      ─────────────────────────────────────────────');
}
