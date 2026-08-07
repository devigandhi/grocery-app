import { HttpException } from '@nestjs/common';
import { rethrowAuthError } from './auth-error.util';

function makeApiError(statusCode: number, message: string) {
  const err = new Error(message) as Error & {
    statusCode: number;
    body: { message: string };
  };
  err.name = 'APIError';
  err.statusCode = statusCode;
  err.body = { message };
  return err;
}

describe('rethrowAuthError', () => {
  it('converts a Better Auth APIError into a matching HttpException', () => {
    const err = makeApiError(409, 'Phone number already in use');

    expect(() => rethrowAuthError(err)).toThrow(HttpException);
    try {
      rethrowAuthError(err);
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(HttpException);
      expect((thrown as HttpException).getStatus()).toBe(409);
      expect((thrown as HttpException).message).toBe(
        'Phone number already in use',
      );
    }
  });

  it('falls back to the error message when body.message is missing', () => {
    const err = new Error('generic failure') as Error & { statusCode?: number };
    err.name = 'APIError';

    expect.assertions(3);
    try {
      rethrowAuthError(err);
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(HttpException);
      expect((thrown as HttpException).getStatus()).toBe(400);
      expect((thrown as HttpException).message).toBe('generic failure');
    }
  });

  it('rethrows non-APIError errors unchanged', () => {
    const err = new TypeError('boom');
    expect(() => rethrowAuthError(err)).toThrow(err);
  });
});
