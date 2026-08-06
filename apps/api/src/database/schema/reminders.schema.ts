import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';


export const reminders = pgTable('reminders', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),

  
  remindAt: timestamp('remind_at', { withTimezone: true }).notNull(),

  
  recurrence: varchar('recurrence', { length: 100 }),

  
  isSent: boolean('is_sent').default(false).notNull(),

  
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
