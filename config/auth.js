import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import crypto from 'node:crypto';
import { prisma } from './prisma.js';
import { extractNames } from '../utils/utils.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { first_name, last_name } = extractNames(user.name);
          await prisma.userProfile.upsert({
            where: { user_id: user.id },
            update: {},
            create: {
              user_id: user.id,
              email: user.email,
              first_name,
              last_name,
            },
          });
        },
      },
    },
  },
});

export default auth;
