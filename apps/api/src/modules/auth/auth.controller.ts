import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /api/auth/register
   * Registrasi user baru. Public route (tidak perlu token).
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/auth/login
   * Login dengan email/phone + password. Mengembalikan access & refresh token.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/auth/refresh
   * Tukar refresh token dengan token pair baru (sliding session rotation).
   * Header: Authorization: Bearer <refresh_token>
   *
   * Client harus menyimpan token baru dan menghapus token lama.
   * Selama user aktif dalam 30 hari, mereka tidak akan pernah diminta login ulang.
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser('id') userId: string,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  /**
   * POST /api/auth/logout
   * Invalidasi refresh token di database. Wajib pakai access token.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
  }

  /**
   * GET /api/auth/me
   * Informasi user yang sedang login (dari JWT payload).
   */
  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return { userId: user.id };
  }

  /**
   * POST /api/auth/qr/generate
   * Membuat QR Session baru untuk login web.
   */
  @Public()
  @Post('qr/generate')
  @HttpCode(HttpStatus.OK)
  async qrGenerate() {
    return this.authService.generateQrSession();
  }

  /**
   * GET /api/auth/qr/status/:id
   * Dipolling oleh web frontend untuk mengetahui status login QR.
   */
  @Public()
  @Get('qr/status/:id')
  @HttpCode(HttpStatus.OK)
  async qrStatus(@Param('id') id: string) {
    return this.authService.checkQrSessionStatus(id);
  }

  /**
   * POST /api/auth/qr/approve
   * Dipanggil oleh Bot untuk menyetujui sesi login QR.
   */
  @Public()
  @Post('qr/approve')
  @HttpCode(HttpStatus.OK)
  async qrApprove(
    @Headers('x-bot-token') botToken: string,
    @Body() body: { sessionId: string; phoneNumber: string },
  ) {
    const botSecret = this.configService.get<string>('BOT_SECRET');
    if (!botToken || botToken !== botSecret) {
      throw new UnauthorizedException('Forbidden: Invalid bot token');
    }
    await this.authService.approveQrSession(body.sessionId, body.phoneNumber);
    return { success: true, message: 'Login QR disetujui' };
  }
}
