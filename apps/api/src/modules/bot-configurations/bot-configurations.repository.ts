import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import * as schema from '../../database/schema';
import { botConfigurations, BotConfiguration } from '../../database/schema';

@Injectable()
export class BotConfigurationsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /**
   * Mengambil konfigurasi bot pertama (global configuration).
   */
  async findFirst(): Promise<BotConfiguration | null> {
    const result = await this.db
      .select()
      .from(botConfigurations)
      .limit(1);
    return result[0] ?? null;
  }

  /**
   * Membuat konfigurasi bot awal jika kosong.
   */
  async createDefault(): Promise<BotConfiguration> {
    const result = await this.db
      .insert(botConfigurations)
      .values({})
      .returning();
    return result[0];
  }

  /**
   * Memperbarui konfigurasi bot.
   */
  async update(
    id: string,
    payload: Partial<Omit<BotConfiguration, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<BotConfiguration> {
    const result = await this.db
      .update(botConfigurations)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(botConfigurations.id, id))
      .returning();
    return result[0];
  }
}
