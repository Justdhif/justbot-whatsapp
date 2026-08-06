import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';


export const otps = pgTable('otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  
  
  code: varchar('code', { length: 6 }).notNull(),
  
  
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
