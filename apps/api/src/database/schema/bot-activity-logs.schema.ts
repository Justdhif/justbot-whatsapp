import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const logDirectionEnum = pgEnum('log_direction', ['incoming', 'outgoing']);
export const logStatusEnum = pgEnum('log_status', ['success', 'failed', 'ignored']);

export const botActivityLogs = pgTable('bot_activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Relasi ke pemilik bot (user dashboard)
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Data Chat WhatsApp
  senderNumber: varchar('sender_number', { length: 20 }).notNull(), // Nomor WhatsApp pengirim (e.g. "62812345...")
  senderName: varchar('sender_name', { length: 100 }),             // Nama profil WhatsApp pengirim
  messageText: text('message_text').notNull(),                      // Isi pesan chat
  direction: logDirectionEnum('direction').notNull(),               // 'incoming' (pesan masuk) atau 'outgoing' (balasan bot)
  
  // Modul yang terpicu (e.g. 'coding', 'finance', 'translate', 'ocr', 'none')
  moduleUsed: varchar('module_used', { length: 50 }),
  
  status: logStatusEnum('status').default('success').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type BotActivityLog = typeof botActivityLogs.$inferSelect;
export type NewBotActivityLog = typeof botActivityLogs.$inferInsert;
