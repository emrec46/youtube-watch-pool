/**
 * page.tsx — /submit
 * YouTube video linki ekleme formu. 50 puan harcar.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { POINTS } from '@/lib/points';
// Navbar dashboard layout'tan geliyor — bu sayfada ayrıca import gerekmez

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ youtubeUrl: '', title: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error || 'Bir hata oluştu.');
      return;
    }

    setSuccess('Videonuz havuza eklendi! Yönlendiriliyorsunuz...');
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-red-400" />
          Video Havuza Ekle
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          YouTube videonu havuza ekle, izlenme al.
        </p>
      </div>

      {/* Puan Uyarısı */}
      <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
        <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 font-medium text-sm">Puan Harcaması</p>
          <p className="text-yellow-500/80 text-xs mt-0.5">
            Bu işlem hesabınızdan <strong>{POINTS.VIDEO_SUBMIT_COST} puan</strong> düşecek.
            İzleyenler her izleme için +{POINTS.WATCH_REWARD} puan kazanır.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4"
      >
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-3">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* YouTube URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">YouTube Linki *</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="url"
              required
              value={form.youtubeUrl}
              onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
            />
          </div>
          <p className="text-gray-600 text-xs">
            youtube.com/watch?v=, youtu.be/ veya youtube.com/shorts/ formatları desteklenir.
          </p>
        </div>

        {/* Başlık */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Video Başlığı *</label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Videonuzun başlığı"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
            />
          </div>
        </div>

        {/* Açıklama */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">
            Açıklama <span className="text-gray-600">(opsiyonel)</span>
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <textarea
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Videonuz hakkında kısa bir açıklama..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Gönder */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          {loading ? 'Ekleniyor...' : `Havuza Ekle (−${POINTS.VIDEO_SUBMIT_COST} puan)`}
        </button>
      </form>
    </div>
  );
}
