import { Inject, Injectable } from '@nestjs/common';
import { and, eq, asc, lte, desc } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import * as schema from '../../database/schema';
import { reminders, NewReminder } from '../../database/schema';

@Injectable()
export class RemindersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async create(data: NewReminder) {
    const result = await this.db.insert(reminders).values(data).returning();
    return result[0];
  }

  async findAll(userId: string) {
    return this.db
      .select()
      .from(reminders)
      .where(and(eq(reminders.userId, userId), eq(reminders.isActive, true)))
      .orderBy(asc(reminders.remindAt));
  }

  async findOne(id: string, userId: string) {
    const result = await this.db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<typeof reminders.$inferInsert>,
  ) {
    const result = await this.db
      .update(reminders)
      .set(data)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string, userId: string) {
    const result = await this.db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  /**
   * Digunakan oleh bot-service untuk mengambil reminder yang belum dikirim
   * dan waktu pengirimannya sudah lewat/tiba.
   */
  async findPendingReminders() {
    const now = new Date();
    return this.db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.isSent, false),
          eq(reminders.isActive, true),
          lte(reminders.remindAt, now),
        ),
      )
      .orderBy(desc(reminders.remindAt));
  }

  async markAsSent(id: string) {
    await this.db
      .update(reminders)
      .set({ isSent: true })
      .where(eq(reminders.id, id));
  }
}
