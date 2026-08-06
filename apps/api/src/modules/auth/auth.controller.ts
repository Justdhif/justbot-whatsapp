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
import { SendOtpDto } from './dto/send-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  
  @Public()
  @Post('register/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  
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

  
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
  }

  
  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return { userId: user.id };
  }

  
  @Public()
  @Post('qr/generate')
  @HttpCode(HttpStatus.OK)
  async qrGenerate() {
    return this.authService.generateQrSession();
  }

  
  @Public()
  @Get('qr/status/:id')
  @HttpCode(HttpStatus.OK)
  async qrStatus(@Param('id') id: string) {
    return this.authService.checkQrSessionStatus(id);
  }

  
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

  
  @Public()
  @Post('bot-token')
  @HttpCode(HttpStatus.OK)
  async getBotToken(
    @Headers('x-bot-token') botToken: string,
    @Body() body: { phoneNumber: string },
  ) {
    const botSecret = this.configService.get<string>('BOT_SECRET');
    if (!botToken || botToken !== botSecret) {
      throw new UnauthorizedException('Forbidden: Invalid bot token');
    }
    return this.authService.generateTokenForBot(body.phoneNumber);
  }
}
