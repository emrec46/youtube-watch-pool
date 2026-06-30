/**
 * seed.ts — Prisma seed script
 * Test kullanıcısı ve örnek videolar oluşturur.
 * Çalıştır: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // Test kullanıcıları
  const passwordHash = await bcrypt.hash('test1234', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: {
      email: 'alice@test.com',
      name: 'Alice',
      passwordHash,
      points: 200,
      pointTransactions: {
        create: {
          amount: 100,
          type: 'REGISTER_BONUS',
          description: 'Hoş geldin bonusu 🎉',
        },
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      name: 'Bob',
      passwordHash,
      points: 150,
      pointTransactions: {
        create: {
          amount: 100,
          type: 'REGISTER_BONUS',
          description: 'Hoş geldin bonusu 🎉',
        },
      },
    },
  });

  console.log(`✅ Kullanıcılar: ${alice.email}, ${bob.email}`);

  // Örnek videolar — gerçek YouTube ID'leri
  const sampleVideos = [
    {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      description: 'Klasik bir hit şarkı.',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      ownerId: alice.id,
    },
    {
      youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      youtubeId: 'jNQXAC9IVRw',
      title: 'Me at the zoo — İlk YouTube Videosu',
      description: 'YouTube tarihinin ilk yüklenen videosu.',
      thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
      ownerId: bob.id,
    },
    {
      youtubeUrl: 'https://www.youtube.com/watch?v=6_b7RDuLwcI',
      youtubeId: '6_b7RDuLwcI',
      title: 'Big Buck Bunny',
      description: 'Açık kaynak animasyon filmi.',
      thumbnailUrl: 'https://img.youtube.com/vi/6_b7RDuLwcI/mqdefault.jpg',
      ownerId: alice.id,
    },
  ];

  for (const video of sampleVideos) {
    await prisma.video.upsert({
      where: { id: `seed-${video.youtubeId}` },
      update: {},
      create: {
        id: `seed-${video.youtubeId}`,
        ...video,
        costPoints: 50,
        rewardPoints: 10,
      },
    });
  }

  console.log(`✅ ${sampleVideos.length} örnek video eklendi.`);
  console.log('');
  console.log('📋 Test Kullanıcıları:');
  console.log('   alice@test.com / test1234');
  console.log('   bob@test.com / test1234');
  console.log('');
  console.log('🌱 Seed tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
