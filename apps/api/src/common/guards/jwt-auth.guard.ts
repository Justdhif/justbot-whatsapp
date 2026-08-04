import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global JWT Auth Guard
 * Di-register sebagai APP_GUARD di AppModule sehingga SEMUA route
 * secara default memerlukan autentikasi JWT yang valid.
 *
 * Pengecualian: route yang ditandai dengan @Public() tidak diproteksi.
 *
 * Flow:
 * 1. Cek apakah route memiliki metadata @Public() → skip auth
 * 2. Validasi Bearer token dari header Authorization
 * 3. Jika valid → request.user diisi dengan JWT payload
 * 4. Jika tidak valid → 401 Unauthorized
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
