import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { RolesGuard } from './roles.guard';

function makeContext(req: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

function makeReflector(required: string[] | undefined) {
  return {
    getAllAndOverride: jest.fn().mockReturnValue(required),
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows the request when no roles are required', () => {
    const guard = new RolesGuard(makeReflector(undefined));
    const req = { user: undefined } as unknown as Request;

    expect(guard.canActivate(makeContext(req))).toBe(true);
  });

  it('allows the request when the user has a required role', () => {
    const guard = new RolesGuard(makeReflector(['ADMIN']));
    const req = { user: { role: 'ADMIN' } } as unknown as Request;

    expect(guard.canActivate(makeContext(req))).toBe(true);
  });

  it('throws ForbiddenException when the user role does not match', () => {
    const guard = new RolesGuard(makeReflector(['ADMIN']));
    const req = { user: { role: 'USER' } } as unknown as Request;

    expect(() => guard.canActivate(makeContext(req))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when req.user is missing', () => {
    const guard = new RolesGuard(makeReflector(['ADMIN']));
    const req = { user: undefined } as unknown as Request;

    expect(() => guard.canActivate(makeContext(req))).toThrow(
      ForbiddenException,
    );
  });
});
