import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';


export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);


export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  type: transactionTypeEnum('type').notNull(),

  
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),

  category: varchar('category', { length: 100 }),
  description: text('description'),

  
  transactionDate: date('transaction_date').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
