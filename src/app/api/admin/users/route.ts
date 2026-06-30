/**
 * /api/admin/users
 * GET  — Tüm kullanıcıları listele
 * PATCH — Kullanıcı puanını güncelle
 * Sadece ADMIN_EMAIL env değişkenindeki email ile giriş yapan kullanıcı erişebilir.
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

// GET /api/admin/users — Tüm kullanıcıları getir
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          videos: true,
          watchSessions: true,
        },
      },
    },
  });

  return NextResponse.json({ users });
}

// PATCH /api/admin/users — Kullanıcı puanını güncelle
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, points, reason } = body as {
    userId: string;
    points: number;
    reason?: string;
  };

  if (!userId || typeof points !== 'number') {
    return NextResponse.json({ error: 'userId ve points gerekli.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
      select: { id: true, email: true, name: true, points: true },
    }),
    prisma.pointTransaction.create({
      data: {
        userId,
        amount: points,
        type: 'ADMIN_ADJUSTMENT',
        description: reason || `Admin tarafından ${points > 0 ? '+' : ''}${points} puan düzenlemesi`,
      },
    }),
  ]);

  return NextResponse.json({ user: updatedUser });
}

// DELETE /api/admin/users — Kullanıcıyı sil
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId gerekli.' }, { status: 400 });
  }

  // Admin kendini silemez
  const adminUser = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL! },
  });
  if (adminUser?.id === userId) {
    return NextResponse.json({ error: 'Admin kendini silemez.' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
