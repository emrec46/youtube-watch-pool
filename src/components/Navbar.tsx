/**
 * Navbar.tsx
 * Üst navigasyon — logo, sayfa linkleri ve kullanıcı puan göstergesi.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Play, Trophy, PlusCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pool', label: 'Havuz', icon: Play },
  { href: '/submit', label: 'Video Ekle', icon: PlusCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { points } = usePoints();

  if (!session) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="hidden sm:block">WatchPool</span>
        </Link>

        {/* Nav Linkleri */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}
        </div>

        {/* Sağ: Puan + Çıkış */}
        <div className="flex items-center gap-3">
          {/* Puan Rozeti */}
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm tabular-nums">
              {points !== null ? points.toLocaleString('tr-TR') : '—'}
            </span>
          </div>

          {/* Kullanıcı adı */}
          <span className="hidden md:block text-gray-400 text-sm truncate max-w-[120px]">
            {session.user?.name}
          </span>

          {/* Çıkış */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Çıkış yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
