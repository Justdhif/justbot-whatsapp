import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  phoneNumber: varchar('phone_number', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }).unique(),

  passwordHash: text('password_hash').notNull(),

  
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
