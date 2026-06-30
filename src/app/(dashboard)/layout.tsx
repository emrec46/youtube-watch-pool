/**
 * layout.tsx — Korumalı sayfa grubu layout
 * Navbar'ı tüm dashboard sayfalarına ekler.
 */

import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
