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

/**
 * Enum: transaction_type
 * Tipe transaksi keuangan.
 */
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

/**
 * Table: transactions
 * Menyimpan data transaksi keuangan (pemasukan & pengeluaran).
 *
 * Catatan: kolom `amount` bertipe numeric(15,2) — presisi tinggi untuk keuangan.
 * Drizzle mengembalikan nilai sebagai string, konversi ke number dilakukan di service.
 */
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  type: transactionTypeEnum('type').notNull(),

  /** Presisi 15 digit, 2 desimal. Maks: 9.999.999.999.999,99 */
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),

  category: varchar('category', { length: 100 }),
  description: text('description'),

  /** Tanggal transaksi (bukan timestamp) — user memilih tanggalnya sendiri */
  transactionDate: date('transaction_date').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
