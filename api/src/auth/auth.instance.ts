import { PrismaService } from '../prisma/prisma.service';

/**
 * `better-auth` and `@better-auth/prisma-adapter` ship ESM-only (no CJS build),
 * while this app compiles to CommonJS — so they're loaded via dynamic `import()`
 * here instead of a static import, which Node can't `require()`.
 *
 * Registration/login are phone number + password only (no OTP/SMS flow — see
 * CLAUDE.md auth section). Better Auth's core credential engine is keyed on
 * `email`, so each user gets a synthetic, never-shown `<phoneNumber>@phone.local`
 * email backing their real `email` column slot; the API surface only ever
 * exposes `phoneNumber`.
 */
export async function createAuth(prisma: PrismaService) {
  const { betterAuth } = await import('better-auth');
  const { prismaAdapter } = await import('@better-auth/prisma-adapter');

  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    trustedOrigins: [process.env.CORS_ORIGIN ?? 'http://localhost:5173'],
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        phoneNumber: {
          type: 'string',
          required: true,
          input: true,
        },
        role: {
          type: 'string',
          required: false,
          defaultValue: 'USER',
          input: false,
        },
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;
