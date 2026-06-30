/**
 * middleware.ts
 * Korumalı route'lar için NextAuth.js session kontrolü.
 * /dashboard, /pool, /submit, /profile → giriş zorunlu
 */

export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/pool/:path*', '/submit/:path*', '/profile/:path*', '/admin/:path*'],
};
