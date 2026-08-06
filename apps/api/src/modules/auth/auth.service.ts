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
import { SendOtpDto } from './dto/send-otp.dto';

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

  async sendOtp(dto: SendOtpDto): Promise<{ success: boolean }> {
    const existing = await this.usersRepository.findByPhoneNumber(dto.phoneNumber);
    if (existing) {
      throw new BadRequestException('Nomor WhatsApp sudah terdaftar');
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 menit kedalwarsa

    // Bersihkan OTP lama untuk nomor ini
    await this.usersRepository.deleteOtpsByPhone(dto.phoneNumber);

    // Simpan OTP baru ke database
    await this.usersRepository.createOtp(dto.phoneNumber, code, expiresAt);

    // Kirim via bot-service relay
    const messageText = 
      `╭────────────────────────────\n` +
      `│  🔑 *KODE OTP VERIFIKASI* 🔑\n` +
      `╰────────────────────────────\n` +
      `Halo! Berikut adalah kode OTP verifikasi pendaftaran akun Manager Anda:\n\n` +
      `👉 *${code}*\n\n` +
      `Kode ini rahasia dan hanya berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`;

    const sent = await this.sendMessageToBot(dto.phoneNumber, messageText);
    if (!sent) {
      throw new BadRequestException('Gagal mengirimkan kode OTP via WhatsApp. Silakan coba lagi.');
    }

    return { success: true };
  }

  async register(dto: RegisterDto): Promise<TokenPair> {
    if (!dto.phoneNumber) {
      throw new BadRequestException('Nomor WhatsApp wajib diisi');
    }

    // Verifikasi OTP dari database
    const validOtp = await this.usersRepository.findValidOtp(dto.phoneNumber, dto.otpCode);
    if (!validOtp) {
      throw new BadRequestException('Kode OTP salah atau telah kedaluwarsa');
    }

    // Cek duplikasi email jika diisi
    if (dto.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing) throw new BadRequestException('Email sudah terdaftar');
    }

    // Cek duplikasi nomor HP
    const existingPhone = await this.usersRepository.findByPhoneNumber(dto.phoneNumber);
    if (existingPhone) throw new BadRequestException('Nomor WhatsApp sudah terdaftar');

    // Hapus OTP dari database setelah sukses diverifikasi
    await this.usersRepository.deleteOtpsByPhone(dto.phoneNumber);

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersRepository.create({
      email: dto.email || null,
      phoneNumber: dto.phoneNumber,
      passwordHash,
    });

    // Buat profile dengan display name (opsional)
    await this.usersRepository.createProfile(user.id, dto.displayName);

    // Kirim pesan selamat datang ke WhatsApp
    const welcomeMessage = 
      `╭────────────────────────────\n` +
      `│  🎉 *AKUN MANAGER TERDAFTAR* 🎉\n` +
      `╰────────────────────────────\n` +
      `Selamat datang! Akun Manager Anda atas nama *${dto.displayName || dto.phoneNumber}* telah berhasil dibuat dan terhubung.\n\n` +
      `Berikut adalah hal-hal yang dapat Anda lakukan langsung via chat WhatsApp:\n` +
      `1. 💰 *Catat Keuangan*: Ketik \`.catat <nominal> <kategori> <keterangan>\` (Contoh: \`.catat 50000 makanan beli nasi padang\`).\n` +
      `2. 📊 *Laporan Keuangan*: Ketik \`.riwayat\` atau \`.summary\` untuk melihat pengeluaran Anda.\n` +
      `3. 🔔 *Pengingat*: Ketik \`.ingatkan <waktu> <deskripsi>\` (Contoh: \`.ingatkan besok jam 8 pagi rapat kerja\`).\n\n` +
      `Silakan ketik \`.menu\` untuk melihat seluruh opsi menu bantuan. Selamat mencoba! 🚀`;

    await this.sendMessageToBot(dto.phoneNumber, welcomeMessage);

    const tokens = await this.generateTokens(user.id);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  private async sendMessageToBot(to: string, text: string): Promise<boolean> {
    try {
      const botServiceUrl = this.configService.get<string>('BOT_SERVICE_URL', 'https://justbot-service.netlify.app');
      const botSecret = this.configService.get<string>('BOT_SECRET', 'justbot_super_secure_bot_secret_key_12345');

      const response = await fetch(`${botServiceUrl}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${botSecret}`,
        },
        body: JSON.stringify({ to, text }),
      });

      if (!response.ok) {
        console.error(`Failed to send message to bot, status: ${response.status}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error calling bot send-message API:', err);
      return false;
    }
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

  async generateTokenForBot(phoneNumber: string): Promise<TokenPair> {
    const user = await this.usersRepository.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new UnauthorizedException('User not registered');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
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
  // QR Login Flows
  // ──────────────────────────────────────────────────────────────────────────

  async generateQrSession(): Promise<{ sessionId: string; qrLink: string }> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expired dalam 5 menit

    const waPhoneNumber = this.configService.get<string>('WA_PHONE_NUMBER_ID'); 
    // Gunakan nomor telepon tujuan bot WA, tapi untuk format tautan kita bisa gunakan link wa.me
    // Kita butuh nomor WA bot dari environment
    const botPhone = this.configService.get<string>('WA_BOT_NUMBER', '6282213111575');

    const result = await this.usersRepository.createQrSession(expiresAt);
    
    // Link yang akan dikonversi menjadi QR Code
    const qrLink = `https://wa.me/${botPhone}?text=.login%20${result.id}`;

    return {
      sessionId: result.id,
      qrLink,
    };
  }

  async checkQrSessionStatus(sessionId: string): Promise<{ status: string; tokens?: TokenPair }> {
    const session = await this.usersRepository.findQrSessionById(sessionId);
    
    if (!session) {
      return { status: 'not_found' };
    }

    if (session.status === 'expired' || new Date() > new Date(session.expiresAt)) {
      if (session.status === 'pending') {
        await this.usersRepository.updateQrSessionStatus(sessionId, 'expired');
      }
      return { status: 'expired' };
    }

    if (session.status === 'approved' && session.userId) {
      // Generate token pair untuk user yang menyetujui
      const tokens = await this.generateTokens(session.userId);
      await this.storeRefreshTokenHash(session.userId, tokens.refreshToken);
      
      // Hapus session setelah digunakan agar tidak bisa dipolling ulang
      await this.usersRepository.deleteQrSession(sessionId);

      return {
        status: 'approved',
        tokens,
      };
    }

    return { status: session.status };
  }

  async approveQrSession(sessionId: string, phoneNumber: string): Promise<boolean> {
    const session = await this.usersRepository.findQrSessionById(sessionId);
    if (!session) {
      throw new BadRequestException('Sesi QR tidak ditemukan');
    }

    if (new Date() > new Date(session.expiresAt)) {
      await this.usersRepository.updateQrSessionStatus(sessionId, 'expired');
      throw new BadRequestException('Sesi QR sudah kedaluwarsa');
    }

    if (session.status !== 'pending') {
      throw new BadRequestException(`Sesi QR sudah tidak aktif (status: ${session.status})`);
    }

    // Cari user berdasarkan nomor HP
    const user = await this.usersRepository.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new BadRequestException('Nomor WhatsApp belum terdaftar di aplikasi.');
    }

    await this.usersRepository.approveQrSession(sessionId, user.id);
    return true;
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
