/**
 * /api/admin/videos
 * GET    — Tüm videoları listele
 * PATCH  — Video aktiflik durumunu toggle et
 * DELETE — Video sil
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

// GET /api/admin/videos — Tüm videoları getir
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
      _count: {
        select: { watchSessions: true },
      },
    },
  });

  return NextResponse.json({ videos });
}

// PATCH /api/admin/videos — Video aktiflik toggle
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const body = await req.json();
  const { videoId, isActive } = body as { videoId: string; isActive: boolean };

  if (!videoId || typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'videoId ve isActive gerekli.' }, { status: 400 });
  }

  const video = await prisma.video.update({
    where: { id: videoId },
    data: { isActive },
    select: { id: true, title: true, isActive: true },
  });

  return NextResponse.json({ video });
}

// DELETE /api/admin/videos — Video sil
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'videoId gerekli.' }, { status: 400 });
  }

  await prisma.video.delete({ where: { id: videoId } });

  return NextResponse.json({ success: true });
}
