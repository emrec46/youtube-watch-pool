/**
 * route.ts — POST /api/register
 * Yeni kullanıcı kaydı — email/şifre ile hesap oluşturur, 100 puan verir.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { POINTS, TRANSACTION_TYPES } from '@/lib/points';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Ad, e-posta ve şifre zorunludur.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const emailNorm = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: emailNorm,
          passwordHash,
          points: POINTS.REGISTER_BONUS,
        },
      });

      await tx.pointTransaction.create({
        data: {
          userId: newUser.id,
          amount: POINTS.REGISTER_BONUS,
          type: TRANSACTION_TYPES.REGISTER_BONUS,
          description: 'Hoş geldin bonusu 🎉',
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Hesap oluşturuldu.',
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/register]', err);
    return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}
