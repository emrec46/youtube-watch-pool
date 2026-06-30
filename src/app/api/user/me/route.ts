/**
 * route.ts — GET /api/user/me
 * Giriş yapmış kullanıcının puan, video ve işlem bilgilerini döndürür.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        createdAt: true,
        videos: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            youtubeId: true,
            thumbnailUrl: true,
            totalViews: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        pointTransactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: { watchSessions: true, videos: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('[GET /api/user/me]', err);
    return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}
