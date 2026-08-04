import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import * as schema from '../../database/schema';
import { users, userProfiles, NewUser } from '../../database/schema';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findByPhoneNumber(phoneNumber: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);
    return result[0] ?? null;
  }

  async findByIdWithProfile(id: string) {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
        isActive: users.isActive,
        createdAt: users.createdAt,
        profile: {
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          timezone: userProfiles.timezone,
          language: userProfiles.language,
        },
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewUser) {
    const result = await this.db.insert(users).values(data).returning();
    return result[0];
  }

  async createProfile(userId: string, displayName?: string) {
    const result = await this.db
      .insert(userProfiles)
      .values({ userId, displayName })
      .returning();
    return result[0];
  }

  async updateProfile(
    userId: string,
    data: Partial<typeof userProfiles.$inferInsert>,
  ) {
    const result = await this.db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return result[0] ?? null;
  }

  /** Simpan hash dari refresh token baru (bukan token aslinya) */
  async updateRefreshTokenHash(userId: string, hash: string) {
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash })
      .where(eq(users.id, userId));
  }

  /** Set refreshTokenHash = NULL saat logout */
  async clearRefreshTokenHash(userId: string) {
    await this.db
      .update(users)
      .set({ refreshTokenHash: null })
      .where(eq(users.id, userId));
  }
}
