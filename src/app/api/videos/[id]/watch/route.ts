/**
 * route.ts — POST /api/videos/[id]/watch
 * İzleme seansını günceller; eşik aşılınca puan verir.
 * Body: { watchedSeconds: number, totalSeconds: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateWatchReward, TRANSACTION_TYPES, isWatchEligible } from '@/lib/points';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    const videoId = params.id;
    const body = await req.json();
    const { watchedSeconds, totalSeconds } = body;

    if (typeof watchedSeconds !== 'number' || typeof totalSeconds !== 'number') {
      return NextResponse.json(
        { success: false, error: 'watchedSeconds ve totalSeconds sayı olmalıdır.' },
        { status: 400 }
      );
    }

    // Video var mı?
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video || !video.isActive) {
      return NextResponse.json({ success: false, error: 'Video bulunamadı.' }, { status: 404 });
    }

    // Kendi videosunu izleyerek puan kazanamaz
    if (video.ownerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Kendi videonuzu izleyerek puan kazanamazsınız.' },
        { status: 400 }
      );
    }

    // Mevcut seans var mı?
    const existingSession = await prisma.watchSession.findUnique({
      where: { userId_videoId: { userId: session.user.id, videoId } },
    });

    // Zaten ödüllendirilmiş mi?
    if (existingSession?.rewarded) {
      return NextResponse.json({
        success: true,
        rewarded: false,
        alreadyRewarded: true,
        message: 'Bu video için zaten puan kazandınız.',
      });
    }

    const eligible = isWatchEligible(watchedSeconds, totalSeconds || video.durationSeconds);

    if (eligible && !existingSession?.rewarded) {
      // Video süresine göre dinamik ödül hesapla
      const effectiveDuration = totalSeconds || video.durationSeconds;
      const pointsEarned = calculateWatchReward(effectiveDuration);

      // Puan ver + seans güncelle — transaction
      await prisma.$transaction(async (tx) => {
        await tx.watchSession.upsert({
          where: { userId_videoId: { userId: session.user.id, videoId } },
          update: {
            watchedSeconds,
            totalSeconds: effectiveDuration,
            rewarded: true,
            completedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            videoId,
            watchedSeconds,
            totalSeconds: effectiveDuration,
            rewarded: true,
            completedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: session.user.id },
          data: { points: { increment: pointsEarned } },
        });

        await tx.pointTransaction.create({
          data: {
            userId: session.user.id,
            amount: pointsEarned,
            type: TRANSACTION_TYPES.WATCH_REWARD,
            description: `"${video.title}" videosu izlendi (+${pointsEarned} puan)`,
          },
        });

        // Video izlenme sayısını artır
        await tx.video.update({
          where: { id: videoId },
          data: { totalViews: { increment: 1 } },
        });
      });

      return NextResponse.json({
        success: true,
        rewarded: true,
        pointsEarned,
        thresholdPercent: 70,
      });
    } else {
      // Sadece seans ilerlemesini güncelle (puan vermeden)
      await prisma.watchSession.upsert({
        where: { userId_videoId: { userId: session.user.id, videoId } },
        update: {
          watchedSeconds,
          totalSeconds: totalSeconds || video.durationSeconds,
        },
        create: {
          userId: session.user.id,
          videoId,
          watchedSeconds,
          totalSeconds: totalSeconds || video.durationSeconds,
          rewarded: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rewarded: false,
      pointsEarned: 0,
      thresholdPercent: 70,
    });
  } catch (err) {
    console.error('[POST /api/videos/[id]/watch]', err);
    return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}
