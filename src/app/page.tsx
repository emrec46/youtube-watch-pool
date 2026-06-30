/**
 * page.tsx — Ana Sayfa (/)
 * Giriş yapılmamışsa landing, yapılmışsa /dashboard'a yönlendir.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Play, Trophy, PlusCircle, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-6">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600 shadow-lg shadow-red-600/30">
          <Play className="w-10 h-10 text-white fill-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
          YouTube{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
            İzlenme Havuzu
          </span>
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed">
          Başkalarının videolarını izle, <strong className="text-yellow-400">puan kazan</strong>.
          Kazandığın puanlarla kendi videolarını havuza ekle ve izlenme al.
        </p>

        {/* Özellik Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Play, title: 'İzle', desc: 'Havuzdaki videoları izle', color: 'text-red-400' },
            { icon: Trophy, title: 'Kazan', desc: '%70 izleyince +10 puan', color: 'text-yellow-400' },
            { icon: PlusCircle, title: 'Yayınla', desc: '50 puana videonuzu ekle', color: 'text-green-400' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
            >
              <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
              <p className="font-semibold text-white">{title}</p>
              <p className="text-gray-500 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Butonları */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Ücretsiz Başla
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>

      <p className="mt-12 text-gray-700 text-sm">
        Kayıt olunca <span className="text-yellow-500 font-semibold">100 puan</span> hediye!
      </p>
    </main>
  );
}
