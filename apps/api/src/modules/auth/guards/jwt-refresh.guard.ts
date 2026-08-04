import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtRefreshGuard
 * Digunakan HANYA pada endpoint POST /auth/refresh.
 * Memvalidasi refresh token (bukan access token) via JwtRefreshStrategy.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
