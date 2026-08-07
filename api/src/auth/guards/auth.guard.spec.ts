import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthService } from '../auth.service';
import { AuthGuard } from './auth.guard';

function makeContext(req: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('attaches req.user and allows the request when a session exists', async () => {
    const getSession = jest.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Jane',
        phoneNumber: '+15551234567',
        role: 'ADMIN',
      },
    });
    const authService = {
      auth: { api: { getSession } },
    } as unknown as AuthService;
    const guard = new AuthGuard(authService);
    const req = { headers: {} } as Request;

    const allowed = await guard.canActivate(makeContext(req));

    expect(allowed).toBe(true);
    expect(req.user).toEqual({
      id: 'user-1',
      name: 'Jane',
      phoneNumber: '+15551234567',
      role: 'ADMIN',
    });
  });

  it('throws UnauthorizedException when there is no session', async () => {
    const getSession = jest.fn().mockResolvedValue(null);
    const authService = {
      auth: { api: { getSession } },
    } as unknown as AuthService;
    const guard = new AuthGuard(authService);
    const req = { headers: {} } as Request;

    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
