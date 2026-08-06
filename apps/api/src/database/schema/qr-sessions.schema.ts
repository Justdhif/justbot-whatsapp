import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';


export const qrSessions = pgTable('qr_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  
  
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export type QrSession = typeof qrSessions.$inferSelect;
export type NewQrSession = typeof qrSessions.$inferInsert;
