import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * Table: qr_sessions
 * Menyimpan sesi login QR code untuk sinkronisasi web frontend & whatsapp bot.
 */
export const qrSessions = pgTable('qr_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Status: pending, approved, expired
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  
  // User ID yang menyetujui login (diisi setelah approved)
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export type QrSession = typeof qrSessions.$inferSelect;
export type NewQrSession = typeof qrSessions.$inferInsert;
