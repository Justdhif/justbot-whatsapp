import { pgTable, uuid, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const botConfigurations = pgTable('bot_configurations', {
  id: uuid('id').defaultRandom().primaryKey(),

  effectiveDays: jsonb('effective_days').$type<number[]>().default([1, 2, 3, 4, 5]).notNull(),

  effectiveHourStart: varchar('effective_hour_start', { length: 5 }).default('08:00').notNull(),
  effectiveHourEnd: varchar('effective_hour_end', { length: 5 }).default('17:00').notNull(),

  isMaintenance: boolean('is_maintenance').default(false).notNull(),

  timezone: varchar('timezone', { length: 50 }).default('Asia/Jakarta').notNull(),

  customWelcomeMessage: varchar('custom_welcome_message', { length: 1000 }),

  updatedBy: uuid('updated_by')
    .references(() => users.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type BotConfiguration = typeof botConfigurations.$inferSelect;
export type NewBotConfiguration = typeof botConfigurations.$inferInsert;
