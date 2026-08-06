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

  
  async updateRefreshTokenHash(userId: string, hash: string) {
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash })
      .where(eq(users.id, userId));
  }

  
  async clearRefreshTokenHash(userId: string) {
    await this.db
      .update(users)
      .set({ refreshTokenHash: null })
      .where(eq(users.id, userId));
  }

  

  async createQrSession(expiresAt: Date) {
    const [result] = await this.db
      .insert(schema.qrSessions)
      .values({
        expiresAt,
        status: 'pending',
      })
      .returning();
    return result;
  }

  async findQrSessionById(id: string) {
    const [result] = await this.db
      .select()
      .from(schema.qrSessions)
      .where(eq(schema.qrSessions.id, id));
    return result;
  }

  async updateQrSessionStatus(id: string, status: string) {
    await this.db
      .update(schema.qrSessions)
      .set({ status })
      .where(eq(schema.qrSessions.id, id));
  }

  async approveQrSession(id: string, userId: string) {
    await this.db
      .update(schema.qrSessions)
      .set({
        status: 'approved',
        userId,
      })
      .where(eq(schema.qrSessions.id, id));
  }

  async deleteQrSession(id: string) {
    await this.db
      .delete(schema.qrSessions)
      .where(eq(schema.qrSessions.id, id));
  }

  
  
  async deleteOtpsByPhone(phoneNumber: string) {
    await this.db
      .delete(schema.otps)
      .where(eq(schema.otps.phoneNumber, phoneNumber));
  }

  async createOtp(phoneNumber: string, code: string, expiresAt: Date) {
    await this.db
      .insert(schema.otps)
      .values({ phoneNumber, code, expiresAt });
  }

  async findValidOtp(phoneNumber: string, code: string) {
    const results = await this.db
      .select()
      .from(schema.otps)
      .where(eq(schema.otps.phoneNumber, phoneNumber));
    
    const now = new Date();
    return results.find(otp => otp.code === code && new Date(otp.expiresAt) > now) ?? null;
  }
}
