import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator @CurrentUser()
 * Mengambil data user yang sudah terautentikasi dari JWT payload.
 *
 * Contoh penggunaan:
 * @Get('me')
 * getMe(@CurrentUser() user: { id: string }) { ... }
 *
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) { ... }
 *
 * @Post('refresh')
 * refresh(@CurrentUser('refreshToken') token: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Record<string, unknown>;
    return data ? user?.[data] : user;
  },
);
