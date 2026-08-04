import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * Table: reminders
 * Menyimpan data reminder yang akan dikirim ke user via WhatsApp.
 *
 * `recurrence`: optional cron-like string untuk reminder berulang
 *   Contoh: "0 8 * * 1-5" = Setiap hari kerja jam 08:00
 *
 * `isSent`: flag untuk menandai bahwa bot sudah mengirim pesan ini,
 *   mencegah duplikasi pengiriman.
 */
export const reminders = pgTable('reminders', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),

  /** Waktu kapan reminder harus dikirim (dengan timezone info) */
  remindAt: timestamp('remind_at', { withTimezone: true }).notNull(),

  /** Optional: cron expression untuk reminder berulang (e.g. "0 9 * * 1") */
  recurrence: varchar('recurrence', { length: 100 }),

  /** Apakah bot sudah mengirim reminder ini? */
  isSent: boolean('is_sent').default(false).notNull(),

  /** User bisa menonaktifkan tanpa menghapus */
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
