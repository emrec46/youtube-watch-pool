# WatchPool — YouTube İzlenme Havuzu

Kullanıcıların YouTube videolarını izleyerek puan kazandığı ve kazandıkları puanlarla kendi videolarını havuza ekleyebildiği bir full-stack web uygulaması.

## Özellikler

- **Puan Sistemi** — İzle → puan kazan → videonu ekle
- **YouTube Embed Player** — IFrame API ile gerçek zamanlı izleme takibi
- **%70 Eşiği** — Videonun %70'ini izleyince ödül verilir
- **Kayıt Bonusu** — Yeni hesaplara otomatik 100 puan
- **Tekrar Koruması** — Aynı video için sadece bir kez puan kazanılır
- **Dashboard** — Puan özeti, videolar ve işlem geçmişi
- **Auth** — NextAuth.js ile güvenli email/şifre girişi

## Puan Kuralları

| Aksiyon | Puan |
|---|---|
| Kayıt ol | +100 |
| Video izle (%70 tamamla) | +10 |
| Video havuza ekle | −50 |

## Teknoloji Stack

- **Framework** — Next.js 14 (App Router)
- **Veritabanı** — SQLite + Prisma ORM v5
- **Auth** — NextAuth.js (Credentials Provider)
- **UI** — Tailwind CSS + lucide-react
- **Video** — YouTube IFrame API
- **Dil** — TypeScript

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd youtube-watch-pool
npm install
```

### 2. Ortam Değişkenlerini Ayarla

```bash
cp .env.example .env
```

`.env` dosyasını düzenle:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```

> **Not:** `NEXTAUTH_SECRET` üretmek için: `openssl rand -base64 32`

### 3. Veritabanını Oluştur

```bash
npx prisma migrate dev
```

### 4. Test Verilerini Yükle (Opsiyonel)

```bash
npx prisma db seed
```

Test kullanıcıları:
- `alice@test.com` / `test1234`
- `bob@test.com` / `test1234`

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Proje Yapısı

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/     # Ana panel — puan + videolar
│   │   ├── pool/          # Video havuzu — izleme ekranı
│   │   └── submit/        # Video ekleme formu
│   ├── api/
│   │   ├── auth/          # NextAuth handler
│   │   ├── register/      # Kayıt endpoint
│   │   ├── videos/        # Video CRUD + izleme
│   │   └── user/me/       # Kullanıcı bilgileri
│   ├── login/             # Giriş sayfası
│   └── register/          # Kayıt sayfası
├── components/
│   ├── Navbar.tsx          # Üst navigasyon + puan rozeti
│   ├── VideoPlayer.tsx     # YouTube embed + izleme takibi
│   └── Providers.tsx       # SessionProvider
├── hooks/
│   └── usePoints.ts        # Puan state hook
├── lib/
│   ├── auth.ts             # NextAuth konfigürasyonu
│   ├── prisma.ts           # Prisma singleton
│   └── points.ts           # Puan sabitleri + yardımcılar
├── types/
│   └── next-auth.d.ts      # Session tip genişletmesi
└── middleware.ts            # Route koruması
```

## API Endpointleri

| Method | URL | Açıklama |
|---|---|---|
| `POST` | `/api/register` | Yeni kullanıcı kaydı |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth handler |
| `GET` | `/api/videos` | Havuzdaki videoları listele |
| `POST` | `/api/videos` | Yeni video ekle (−50 puan) |
| `POST` | `/api/videos/[id]/watch` | İzleme seansı güncelle |
| `GET` | `/api/user/me` | Kullanıcı bilgileri + puanı |

## Veritabanı Komutları

```bash
# Migration oluştur
npx prisma migrate dev --name <isim>

# Prisma Studio'yu aç (görsel DB arayüzü)
npx prisma studio

# Seed çalıştır
npx prisma db seed
```
