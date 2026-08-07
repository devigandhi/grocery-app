import { HttpException } from '@nestjs/common';

/** Re-throws a Better Auth `APIError` (thrown when not using `asResponse: true`) as a matching NestJS HttpException. */
export function rethrowAuthError(err: unknown): never {
  if (err instanceof Error && err.name === 'APIError') {
    const apiErr = err as Error & {
      statusCode?: number;
      body?: { message?: string };
    };
    throw new HttpException(
      apiErr.body?.message ?? apiErr.message,
      apiErr.statusCode ?? 400,
    );
  }
  throw err;
}
