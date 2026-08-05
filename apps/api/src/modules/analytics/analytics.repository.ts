import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import * as schema from '../../database/schema';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async getUserReminders(userId: string) {
    return this.db
      .select({
        id: schema.reminders.id,
        title: schema.reminders.title,
        createdAt: schema.reminders.createdAt,
      })
      .from(schema.reminders)
      .where(eq(schema.reminders.userId, userId));
  }

  async getUserTransactions(userId: string) {
    return this.db
      .select({
        id: schema.transactions.id,
        description: schema.transactions.description,
        type: schema.transactions.type,
        amount: schema.transactions.amount,
        createdAt: schema.transactions.createdAt,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, userId));
  }
}
