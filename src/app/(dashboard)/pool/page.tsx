/**
 * page.tsx — /pool
 * İzlenebilir videolar havuzu.
 * Kullanıcı bir video seçer, embed player ile izler, %70'de puan kazanır.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { Play, Trophy, Eye, Search, Loader2, RefreshCw, ChevronLeft } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';
import { POINTS } from '@/lib/points';

interface WatchSession {
  rewarded: boolean;
  watchedSeconds: number;
}

interface Owner {
  id: string;
  name: string;
}

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  totalViews: number;
  rewardPoints: number;
  owner: Owner;
  watchSessions: WatchSession[];
}

export default function PoolPage() {
  const { points, refetch: refetchPoints } = usePoints();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Video | null>(null);
  const [search, setSearch] = useState('');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos?limit=50');
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch {
      // sessizce devam et
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.owner.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRewarded = async () => {
    await refetchPoints();
    // Seçili videonun durumunu güncelle
    if (selected) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === selected.id
            ? { ...v, watchSessions: [{ rewarded: true, watchedSeconds: 999 }] }
            : v
        )
      );
    }
  };

  // Video seçilmişse player ekranını göster
  if (selected) {
    const alreadyRewarded = selected.watchSessions?.[0]?.rewarded ?? false;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Geri Butonu */}
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Havuza Dön
        </button>

        {/* Video Başlığı */}
        <div>
          <h2 className="text-xl font-bold text-white">{selected.title}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {selected.owner.name} tarafından eklendi
          </p>
        </div>

        {/* Player */}
        <VideoPlayer
          videoId={selected.youtubeId}
          dbVideoId={selected.id}
          alreadyRewarded={alreadyRewarded}
          onRewarded={handleRewarded}
        />

        {/* Video Açıklaması */}
        {selected.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm leading-relaxed">{selected.description}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık + Puan */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Video Havuzu</h1>
          <p className="text-gray-500 text-sm mt-1">
            Videoları izle, %{POINTS.WATCH_THRESHOLD_PERCENT} tamamlayınca +{POINTS.WATCH_REWARD} puan kazan.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1.5 flex-shrink-0">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-300 font-bold text-sm tabular-nums">
            {points !== null ? points.toLocaleString('tr-TR') : '—'}
          </span>
        </div>
      </div>

      {/* Arama + Yenile */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Video veya kanal adı ara..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
          />
        </div>
        <button
          onClick={fetchVideos}
          disabled={loading}
          className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors disabled:opacity-50"
          title="Yenile"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Video Listesi */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Play className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {search ? 'Arama sonucu bulunamadı.' : 'Havuzda henüz video yok.'}
          </p>
          <p className="text-gray-700 text-sm mt-1">
            {!search && 'Diğer kullanıcılar video ekledikçe burada görünecek.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video) => {
            const rewarded = video.watchSessions?.[0]?.rewarded ?? false;

            return (
              <button
                key={video.id}
                onClick={() => setSelected(video)}
                className="group text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/40"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-800 overflow-hidden">
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-10 h-10 text-gray-600" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Ödül rozeti */}
                  {rewarded ? (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Kazandın
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      +{video.rewardPoints} puan
                    </div>
                  )}
                </div>

                {/* Bilgi */}
                <div className="p-4">
                  <p className="text-white font-medium text-sm leading-snug line-clamp-2 mb-2">
                    {video.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate">{video.owner.name}</span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Eye className="w-3 h-3" />
                      {video.totalViews}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
