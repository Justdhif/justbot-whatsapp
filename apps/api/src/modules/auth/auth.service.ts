import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_SALT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Either email or phoneNumber is required');
    }

    // Cek duplikasi email
    if (dto.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing) throw new BadRequestException('Email already registered');
    }

    // Cek duplikasi phone
    if (dto.phoneNumber) {
      const existing = await this.usersRepository.findByPhoneNumber(dto.phoneNumber);
      if (existing) throw new BadRequestException('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersRepository.create({
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      passwordHash,
    });

    // Buat profile dengan display name (opsional)
    await this.usersRepository.createProfile(user.id, dto.displayName);

    const tokens = await this.generateTokens(user.id);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Either email or phoneNumber is required');
    }

    const user = dto.email
      ? await this.usersRepository.findByEmail(dto.email)
      : await this.usersRepository.findByPhoneNumber(dto.phoneNumber!);

    if (!user) {
      // Gunakan pesan umum untuk mencegah user enumeration attack
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Refresh Token Rotation (sliding session)
   *
   * Alur:
   * 1. Verifikasi signature refresh token via JwtRefreshStrategy (sudah dilakukan sebelum method ini dipanggil)
   * 2. Ambil user dari DB, cek apakah refreshTokenHash ada
   * 3. Bandingkan raw refresh token dengan hash di DB (bcrypt.compare)
   * 4. Jika cocok: generate token pair baru, simpan hash baru, hapus hash lama
   * 5. Return token pair baru
   *
   * Dengan cara ini:
   * - Selama user aktif menggunakan app, refresh token selalu diperpanjang (30 hari sliding)
   * - Refresh token lama tidak bisa dipakai lagi setelah di-rotate
   * - Token theft detection: jika refresh token lama digunakan setelah rotasi → akses ditolak
   */
  async refreshTokens(userId: string, rawRefreshToken: string): Promise<TokenPair> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session expired. Please login again.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      rawRefreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      // Token tidak cocok dengan hash → kemungkinan token theft, invalidate session
      await this.usersRepository.clearRefreshTokenHash(userId);
      throw new UnauthorizedException('Invalid refresh token. Please login again.');
    }

    // Generate token pair baru dan rotate refresh token
    const tokens = await this.generateTokens(user.id);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.clearRefreshTokenHash(userId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  private async generateTokens(userId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, type: 'access' },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, type: 'refresh' },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
    await this.usersRepository.updateRefreshTokenHash(userId, hash);
  }
}
