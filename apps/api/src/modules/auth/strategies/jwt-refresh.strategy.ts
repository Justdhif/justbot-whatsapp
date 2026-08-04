import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * JWT Refresh Token Strategy
 * Digunakan KHUSUS untuk endpoint POST /auth/refresh.
 *
 * Strategy ini juga meng-extract raw refresh token dari header
 * agar bisa diverifikasi hash-nya di database (untuk rotasi token).
 *
 * Flow refresh token rotation (sliding session):
 * 1. Client kirim: Authorization: Bearer <refresh_token>
 * 2. Strategy verifikasi signature dengan JWT_REFRESH_SECRET
 * 3. AuthService verifikasi hash token vs hash di DB
 * 4. Jika cocok → generate access_token + refresh_token baru
 * 5. Hash refresh_token baru disimpan ke DB, yang lama dihapus
 * 6. Client simpan token baru → selama aktif dalam 30 hari, tidak perlu login ulang
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }


  validate(
    req: Request,
    payload: JwtRefreshPayload,
  ): { id: string; refreshToken: string } {
    // Ekstrak raw refresh token untuk diverifikasi hash-nya di service
    const refreshToken = req
      .get('Authorization')
      ?.replace('Bearer', '')
      .trim() ?? '';

    return {
      id: payload.sub,
      refreshToken,
    };
  }
}
