import type { AuthService } from '../auth/auth.service';
import type { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma, type MockPrisma } from '../test/prisma-mock';
import { UsersService } from './users.service';

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

describe('UsersService', () => {
  let prisma: MockPrisma;
  let signUpEmail: jest.Mock;
  let authService: AuthService;
  let service: UsersService;

  beforeEach(() => {
    prisma = createMockPrisma();
    signUpEmail = jest.fn();
    authService = { auth: { api: { signUpEmail } } } as unknown as AuthService;
    service = new UsersService(prisma as unknown as PrismaService, authService);
  });

  describe('create', () => {
    const baseDto = {
      name: 'Jane',
      phoneNumber: '+15551234567',
      password: 'password123',
    };

    it('signs up via Better Auth with a synthetic email and returns the created user', async () => {
      signUpEmail.mockResolvedValue({ user: { id: 'user-1' } });
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        role: 'USER',
      });

      await service.create(baseDto, new Headers());

      expect(signUpEmail).toHaveBeenCalledWith({
        body: {
          email: '+15551234567@phone.local',
          password: 'password123',
          name: 'Jane',
          phoneNumber: '+15551234567',
        },
        headers: expect.any(Headers),
      });
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.objectContaining({ id: true, name: true }),
      });
    });

    it('promotes to ADMIN only when the dto requests it', async () => {
      signUpEmail.mockResolvedValue({ user: { id: 'user-1' } });
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        role: 'ADMIN',
      });

      await service.create({ ...baseDto, role: 'ADMIN' }, new Headers());

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'ADMIN' },
      });
    });

    it('does not promote when no role (or USER) is requested', async () => {
      signUpEmail.mockResolvedValue({ user: { id: 'user-1' } });
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        role: 'USER',
      });

      await service.create(baseDto, new Headers());

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rethrows a Better Auth signup failure as an HttpException', async () => {
      signUpEmail.mockRejectedValue(
        makeApiError(409, 'Phone number already in use'),
      );

      await expect(
        service.create(baseDto, new Headers()),
      ).rejects.toMatchObject({
        message: 'Phone number already in use',
      });
      expect(prisma.user.findUniqueOrThrow).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('keeps the synthetic auth email in sync when the phone number changes', async () => {
      prisma.user.update.mockResolvedValue({ id: 'user-1' });

      await service.update('user-1', { phoneNumber: '+15559998888' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          phoneNumber: '+15559998888',
          email: '+15559998888@phone.local',
        },
        select: expect.objectContaining({ id: true }),
      });
    });

    it('omits the email field when the phone number is not being updated', async () => {
      prisma.user.update.mockResolvedValue({ id: 'user-1' });

      await service.update('user-1', { name: 'New Name' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'New Name' },
        select: expect.objectContaining({ id: true }),
      });
    });
  });
});
