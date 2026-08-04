import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte, lte, sql, desc } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import * as schema from '../../database/schema';
import { transactions, NewTransaction } from '../../database/schema';

export interface TransactionFilters {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  category?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class FinanceRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async create(data: NewTransaction) {
    const result = await this.db.insert(transactions).values(data).returning();
    return result[0];
  }

  async findAll(userId: string, filters: TransactionFilters = {}) {
    const { type, startDate, endDate, category, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const conditions = [eq(transactions.userId, userId)];

    if (type) conditions.push(eq(transactions.type, type));
    if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
    if (endDate) conditions.push(lte(transactions.transactionDate, endDate));
    if (category) conditions.push(eq(transactions.category, category));

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(and(...conditions)),
    ]);

    return {
      data: rows,
      meta: {
        total: countResult[0]?.count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const result = await this.db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<typeof transactions.$inferInsert>,
  ) {
    const result = await this.db
      .update(transactions)
      .set(data)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string, userId: string) {
    const result = await this.db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  /** Summary: total income, total expense, dan saldo bersih */
  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const conditions = [eq(transactions.userId, userId)];
    if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
    if (endDate) conditions.push(lte(transactions.transactionDate, endDate));

    const result = await this.db
      .select({
        type: transactions.type,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.type);

    const income = result.find((r) => r.type === 'income')?.total ?? '0';
    const expense = result.find((r) => r.type === 'expense')?.total ?? '0';
    const balance = (parseFloat(income) - parseFloat(expense)).toFixed(2);

    return {
      totalIncome: income,
      totalExpense: expense,
      balance,
    };
  }
}
