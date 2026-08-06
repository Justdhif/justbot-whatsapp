import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Table: otps
 * Menyimpan data OTP sementara untuk pendaftaran/verifikasi nomor WhatsApp.
 */
export const otps = pgTable('otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Nomor HP lengkap dengan kode negara, contoh: 62812xxx
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  
  // Kode verifikasi 6 digit
  code: varchar('code', { length: 6 }).notNull(),
  
  // Waktu kedaluwarsa OTP
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
