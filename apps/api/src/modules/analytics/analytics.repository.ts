import { Inject, Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import * as schema from '../../database/schema';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async getBotActivityLogs(userId: string) {
    return this.db
      .select()
      .from(schema.botActivityLogs)
      .where(eq(schema.botActivityLogs.userId, userId))
      .orderBy(desc(schema.botActivityLogs.createdAt));
  }

  async createActivityLog(data: typeof schema.botActivityLogs.$inferInsert) {
    const result = await this.db.insert(schema.botActivityLogs).values(data).returning();
    return result[0];
  }
}
