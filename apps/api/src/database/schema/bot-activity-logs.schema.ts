import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const logDirectionEnum = pgEnum('log_direction', ['incoming', 'outgoing']);
export const logStatusEnum = pgEnum('log_status', ['success', 'failed', 'ignored']);

export const botActivityLogs = pgTable('bot_activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  
  senderNumber: varchar('sender_number', { length: 20 }).notNull(), 
  senderName: varchar('sender_name', { length: 100 }),             
  messageText: text('message_text').notNull(),                      
  direction: logDirectionEnum('direction').notNull(),               
  
  
  moduleUsed: varchar('module_used', { length: 50 }),
  
  status: logStatusEnum('status').default('success').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type BotActivityLog = typeof botActivityLogs.$inferSelect;
export type NewBotActivityLog = typeof botActivityLogs.$inferInsert;
