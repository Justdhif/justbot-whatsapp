import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator @Public()
 * Menandai suatu route sebagai public (tidak perlu JWT auth).
 *
 * Karena JwtAuthGuard di-set sebagai global guard, semua route
 * secara default memerlukan token. Gunakan @Public() untuk pengecualian:
 *
 * @Public()
 * @Post('register')
 * register() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
