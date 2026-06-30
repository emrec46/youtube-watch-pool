/**
 * Providers.tsx
 * NextAuth SessionProvider — tüm client bileşenlerine session sağlar.
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
