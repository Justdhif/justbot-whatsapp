import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

/**
 * JWT Access Token Strategy
 * Digunakan oleh JwtAuthGuard (global guard) untuk memvalidasi
 * semua protected route.
 *
 * Token diambil dari header: Authorization: Bearer <access_token>
 *
 * Catatan: process.env diakses langsung di super() karena ConfigService
 * belum tersedia saat Passport memanggil super() di constructor.
 * Ini adalah pattern standar NestJS + Passport.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtAccessPayload): { id: string } {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { id: payload.sub };
  }
}
