/**
 * points.ts
 * Puan sistemi sabitlerini ve yardımcı fonksiyonları tanımlar.
 */

// ─── Puan Sabitleri ───────────────────────────────────────────
export const POINTS = {
  /** Yeni kullanıcı kayıt bonusu */
  REGISTER_BONUS: 100,

  /**
   * Sabit ödül (artık kullanılmıyor — calculateWatchReward() ile hesaplanıyor).
   * Geriye dönük uyumluluk için bırakıldı.
   */
  WATCH_REWARD: 10,

  /** Kendi videonu havuza eklemek için gereken puan */
  VIDEO_SUBMIT_COST: 50,

  /** İzleme tamamlanmış sayılması için gereken minimum yüzde */
  WATCH_THRESHOLD_PERCENT: 70,

  /** Dakika başı kazanılan puan (süreye göre dinamik hesap için) */
  POINTS_PER_MINUTE: 60,

  /** Minimum izleme ödülü (saniyeler ne kadar kısa olursa olsun) */
  MIN_WATCH_REWARD: 20,

  /** Maksimum izleme ödülü (çok uzun videolar için tavan) */
  MAX_WATCH_REWARD: 600,
} as const;

// ─── İşlem Tipi Sabitleri ─────────────────────────────────────
export const TRANSACTION_TYPES = {
  REGISTER_BONUS: 'REGISTER_BONUS',
  WATCH_REWARD: 'WATCH_REWARD',
  VIDEO_SUBMIT: 'VIDEO_SUBMIT',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

/**
 * Video süresine göre dinamik izleme ödülü hesaplar.
 * Formül: dakika * POINTS_PER_MINUTE, min/max arasında sınırlandırılır.
 *
 * Örnekler:
 *   10 sn  → 20 puan (minimum)
 *   1 dk   → 60 puan
 *   5 dk   → 300 puan
 *   10 dk  → 600 puan
 *   30 dk  → 600 puan (maksimum)
 */
export function calculateWatchReward(durationSeconds: number): number {
  if (durationSeconds <= 0) return POINTS.MIN_WATCH_REWARD;
  const minutes = durationSeconds / 60;
  const raw = Math.round(minutes * POINTS.POINTS_PER_MINUTE);
  return Math.max(POINTS.MIN_WATCH_REWARD, Math.min(POINTS.MAX_WATCH_REWARD, raw));
}

/**
 * İzleme yüzdesine göre puan kazanılıp kazanılamayacağını kontrol eder.
 * @param watchedSeconds - İzlenen saniye
 * @param totalSeconds - Videonun toplam saniyesi
 */
export function isWatchEligible(watchedSeconds: number, totalSeconds: number): boolean {
  if (totalSeconds <= 0) return false;
  const percent = (watchedSeconds / totalSeconds) * 100;
  return percent >= POINTS.WATCH_THRESHOLD_PERCENT;
}

/**
 * YouTube URL'sinden video ID çıkarır.
 * Desteklenen formatlar:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * YouTube video ID'sinden thumbnail URL oluşturur.
 */
export function getThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}
