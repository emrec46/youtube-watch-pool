/**
 * route.ts — GET/POST /api/videos
 * GET: Havuzdaki aktif videoları listeler (kendi videoları hariç)
 * POST: Yeni video ekler (puan harcar)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { POINTS, TRANSACTION_TYPES, extractYouTubeId, getThumbnailUrl } from '@/lib/points';

// GET /api/videos — havuzdaki videoları listele
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const skip = (page - 1) * limit;

    // Kullanıcının kendi videoları hariç, aktif videolar
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          isActive: true,
          ownerId: { not: session.user.id },
        },
        include: {
          owner: { select: { id: true, name: true } },
          watchSessions: {
            where: { userId: session.user.id },
            select: { rewarded: true, watchedSeconds: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.video.count({
        where: { isActive: true, ownerId: { not: session.user.id } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      videos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/videos]', err);
    return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}

// POST /api/videos — yeni video ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    const body = await req.json();
    const { youtubeUrl, title, description } = body;

    if (!youtubeUrl?.trim() || !title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'YouTube linki ve başlık zorunludur.' },
        { status: 400 }
      );
    }

    const youtubeId = extractYouTubeId(youtubeUrl.trim());
    if (!youtubeId) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz YouTube linki. Lütfen geçerli bir YouTube URL girin.' },
        { status: 400 }
      );
    }

    // Kullanıcının yeterli puanı var mı?
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    if (user.points < POINTS.VIDEO_SUBMIT_COST) {
      return NextResponse.json(
        {
          success: false,
          error: `Yetersiz puan. Video eklemek için ${POINTS.VIDEO_SUBMIT_COST} puan gerekli, mevcut: ${user.points}.`,
        },
        { status: 400 }
      );
    }

    const thumbnailUrl = getThumbnailUrl(youtubeId);

    // Video ekle + puan düş — transaction
    const video = await prisma.$transaction(async (tx) => {
      const newVideo = await tx.video.create({
        data: {
          youtubeUrl: youtubeUrl.trim(),
          youtubeId,
          title: title.trim(),
          description: description?.trim() ?? null,
          thumbnailUrl,
          costPoints: POINTS.VIDEO_SUBMIT_COST,
          rewardPoints: POINTS.WATCH_REWARD,
          ownerId: session.user.id,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { points: { decrement: POINTS.VIDEO_SUBMIT_COST } },
      });

      await tx.pointTransaction.create({
        data: {
          userId: session.user.id,
          amount: -POINTS.VIDEO_SUBMIT_COST,
          type: TRANSACTION_TYPES.VIDEO_SUBMIT,
          description: `"${title.trim()}" videosu havuza eklendi`,
        },
      });

      return newVideo;
    });

    return NextResponse.json({ success: true, video }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/videos]', err);
    return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}
