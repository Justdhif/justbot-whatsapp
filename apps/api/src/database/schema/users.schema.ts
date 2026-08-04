import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * Table: users
 * Core auth table. Semua data sensitif di-hash sebelum disimpan.
 *
 * Refresh token strategy (Instagram/TikTok-like sliding session):
 * - Hanya hash dari refresh token yang disimpan (bukan token aslinya)
 * - Setiap kali token di-refresh, hash lama dihapus dan diganti hash baru
 * - Jika user logout, refreshTokenHash di-set NULL → token lama tidak bisa dipakai lagi
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  phoneNumber: varchar('phone_number', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }).unique(),

  passwordHash: text('password_hash').notNull(),

  /**
   * Hanya menyimpan HASH dari refresh token (bcrypt).
   * Token asli tidak pernah disimpan di database.
   * NULL = user sudah logout atau belum pernah login.
   */
  refreshTokenHash: text('refresh_token_hash'),

  role: varchar('role', { length: 20 }).default('user').notNull(),

  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
