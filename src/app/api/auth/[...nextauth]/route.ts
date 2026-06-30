/**
 * route.ts — /api/auth/[...nextauth]
 * NextAuth.js handler — tüm auth isteklerini yönetir.
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
