import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    // the user will be redirected to the custom login page, rather than the NextAuth.js default page
    signIn: '/login',
  },
};
