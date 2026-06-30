/**
 * GET /api/leaderboard
 * Top 50 kullanıcıyı puana göre sıralı döndürür.
 * Oturum gerektirmez — herkese açık endpoint.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        points: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            watchSessions: { where: { rewarded: true } },
          },
        },
      },
    });

    // Kendi sırasını da bul (giriş yapmışsa)
    let myRank: number | null = null;
    if (session?.user?.email) {
      const me = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, points: true },
      });
      if (me) {
        // Kaç kişi benden fazla puana sahip?
        const above = await prisma.user.count({
          where: { points: { gt: me.points } },
        });
        myRank = above + 1;
      }
    }

    const ranked = users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      points: u.points,
      videoCount: u._count.videos,
      watchCount: u._count.watchSessions,
      joinedAt: u.createdAt,
      isMe: session?.user?.email
        ? false // name karşılaştırması yerine aşağıda id ile yapılıyor
        : false,
    }));

    // isMe alanını id bazlı işaretle
    if (session?.user?.email) {
      const me = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (me) {
        ranked.forEach((r) => {
          (r as typeof r & { isMe: boolean }).isMe = r.id === me.id;
        });
      }
    }

    return NextResponse.json({ leaderboard: ranked, myRank });
  } catch (err) {
    console.error('[leaderboard] GET error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
