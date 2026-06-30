/**
 * page.tsx — /dashboard
 * Kullanıcının puan özeti, kendi videoları ve son işlemler.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Play,
  PlusCircle,
  Eye,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { POINTS } from '@/lib/points';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      videos: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      pointTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          watchSessions: { where: { rewarded: true } },
          videos: true,
        },
      },
    },
  });

  if (!user) redirect('/login');

  const totalEarned = user.pointTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-white">Merhaba, {user.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">İşte hesap özetin</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Puan */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Mevcut Puan</p>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-300">{user.points.toLocaleString('tr-TR')}</p>
          <p className="text-gray-600 text-xs mt-1">
            Video eklemek: -{POINTS.VIDEO_SUBMIT_COST} puan
          </p>
        </div>

        {/* Video Sayısı */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Videolarım</p>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Play className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{user._count.videos}</p>
          <p className="text-gray-600 text-xs mt-1">Havuzdaki video</p>
        </div>

        {/* İzleme Sayısı */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">İzledim</p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{user._count.watchSessions}</p>
          <p className="text-gray-600 text-xs mt-1">Ödüllü izleme</p>
        </div>

        {/* Toplam Kazanılan */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-sm">Toplam Kazanılan</p>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalEarned.toLocaleString('tr-TR')}</p>
          <p className="text-gray-600 text-xs mt-1">Tüm zamanlar</p>
        </div>
      </div>

      {/* Alt Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Videolarım */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Videolarım</h2>
            <Link
              href="/submit"
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Video Ekle
            </Link>
          </div>

          {user.videos.length === 0 ? (
            <div className="text-center py-8">
              <Play className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Henüz video eklemediniz.</p>
              <Link
                href="/submit"
                className="inline-block mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
              >
                İlk videonuzu ekleyin →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.videos.map((v) => (
                <div key={v.id} className="flex items-center gap-3">
                  {v.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-16 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-800"
                    />
                  ) : (
                    <div className="w-16 h-10 rounded-lg bg-gray-800 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{v.title}</p>
                    <p className="text-gray-500 text-xs">{v.totalViews} izlenme</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son İşlemler */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Son İşlemler</h2>

          {user.pointTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Henüz işlem yok.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {user.pointTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {t.amount > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm flex-1 truncate">{t.description}</p>
                  <p
                    className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                      t.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/pool"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          Havuza Git — Puan Kazan
        </Link>
        <Link
          href="/submit"
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Video Ekle ({POINTS.VIDEO_SUBMIT_COST} puan)
        </Link>
      </div>
    </div>
  );
}
