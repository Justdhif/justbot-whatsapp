import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}


@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (
          value !== null &&
          typeof value === 'object' &&
          'data' in (value as object)
        ) {
          const { data, meta } = value as { data: T; meta?: Record<string, unknown> };
          return { success: true, data, ...(meta ? { meta } : {}) };
        }
        return { success: true, data: value as T };
      }),
    );
  }
}
