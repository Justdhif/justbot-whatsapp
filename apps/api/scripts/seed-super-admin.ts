import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeed(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('\n⚙️  1. Menerapkan skema baru ke database Neon...');

  // 1. Tambahkan kolom role ke tabel users jika belum ada
  try {
    await sql(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'user' NOT NULL;
    `);
    console.log('   ✓ Kolom "role" berhasil ditambahkan ke tabel "users".');
  } catch (err: any) {
    console.error('   ❌ Gagal menambahkan kolom "role":', err.message);
  }

  // 2. Buat tabel bot_configurations jika belum ada
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS "bot_configurations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "effective_days" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
        "effective_hour_start" varchar(5) DEFAULT '08:00' NOT NULL,
        "effective_hour_end" varchar(5) DEFAULT '17:00' NOT NULL,
        "is_maintenance" boolean DEFAULT false NOT NULL,
        "timezone" varchar(50) DEFAULT 'Asia/Jakarta' NOT NULL,
        "custom_welcome_message" varchar(1000),
        "updated_by" uuid,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ Tabel "bot_configurations" berhasil dibuat/diverifikasi.');
  } catch (err: any) {
    console.error('   ❌ Gagal membuat tabel "bot_configurations":', err.message);
  }

  // 3. Tambahkan Foreign Key ke bot_configurations jika belum ada
  try {
    await sql(`
      ALTER TABLE "bot_configurations" 
      ADD CONSTRAINT "bot_configurations_updated_by_users_id_fk" 
      FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
    `);
    console.log('   ✓ Foreign key "updated_by" berhasil dipasang.');
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      console.log('   ✓ Foreign key "updated_by" sudah ada.');
    } else {
      console.error('   ❌ Gagal memasang foreign key:', err.message);
    }
  }

  console.log('\n🔑 2. Melakukan Seeding Super Admin...');

  // Info Super Admin
  const adminEmail = 'superadmin@justbot.com';
  const adminPhone = '628123456789';
  const adminPassword = 'SuperAdmin123!';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  try {
    // Cek apakah super admin sudah ada
    const existing = await sql(`SELECT id FROM "users" WHERE email = $1`, [adminEmail]);

    let userId: string;

    if (existing.length > 0) {
      userId = existing[0].id;
      console.log(`   ⚠  User Super Admin (${adminEmail}) sudah terdaftar.`);
      // Update password & role just in case
      await sql(`
        UPDATE "users" 
        SET "password_hash" = $1, "role" = 'super_admin' 
        WHERE id = $2
      `, [passwordHash, userId]);
      console.log('   ✓ Password & role Super Admin berhasil diperbarui.');
    } else {
      // Insert user baru
      const insertRes = await sql(`
        INSERT INTO "users" ("phone_number", "email", "password_hash", "role", "is_active")
        VALUES ($1, $2, $3, 'super_admin', true)
        RETURNING id
      `, [adminPhone, adminEmail, passwordHash]);
      userId = insertRes[0].id;
      console.log('   ✓ User Super Admin berhasil ditambahkan.');

      // Insert profile
      await sql(`
        INSERT INTO "user_profiles" ("user_id", "display_name", "timezone", "language")
        VALUES ($1, 'Super Admin', 'Asia/Jakarta', 'id')
      `, [userId]);
      console.log('   ✓ Profile Super Admin berhasil dibuat.');
    }

    // 4. Inisialisasi data bot_configurations (baris pertama) jika kosong
    const configs = await sql(`SELECT id FROM "bot_configurations" LIMIT 1`);
    if (configs.length === 0) {
      await sql(`
        INSERT INTO "bot_configurations" ("updated_by")
        VALUES ($1)
      `, [userId]);
      console.log('   ✓ Baris konfigurasi default bot berhasil diinisialisasi.');
    } else {
      console.log('   ✓ Konfigurasi default bot sudah ada.');
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 PROSES SEEDING & MIGRASI BERHASIL!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📧 Email    : ${adminEmail}`);
    console.log(`📱 Nomor WA : ${adminPhone}`);
    console.log(`🔑 Password : ${adminPassword}`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (err: any) {
    console.error('❌ Terjadi kesalahan saat seeding:', err.message);
    process.exit(1);
  }
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
