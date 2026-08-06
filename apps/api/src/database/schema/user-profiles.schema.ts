import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';


export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),

  
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Jakarta').notNull(),
  language: varchar('language', { length: 10 }).default('id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
