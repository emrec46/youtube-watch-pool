/**
 * /leaderboard
 * En fazla puana sahip top 50 kullanıcının sıralama tablosu.
 */

'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Play, Eye, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  videoCount: number;
  watchCount: number;
  joinedAt: string;
  isMe: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
        <Crown className="w-4 h-4 text-white" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
      <span className="text-gray-400 text-xs font-bold">{rank}</span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Renk: ismin charCode'una göre deterministik
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(name.length - 1) * 13) % 360;

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: `hsl(${hue}, 60%, 40%)` }}
    >
      {initials}
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Veri alınamadı');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Liderlik tablosu yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const top3 = data?.leaderboard.slice(0, 3) ?? [];
  const rest = data?.leaderboard.slice(3) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Liderlik Tablosu
          </h1>
          <p className="text-gray-400 text-sm mt-1">En fazla puan kazanan kullanıcılar</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Kendi sıram */}
      {data?.myRank && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-300 text-sm font-medium">
            Senin sıran: <strong className="text-yellow-200 text-base">#{data.myRank}</strong>
          </span>
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Yükleniyor…</p>
        </div>
      )}

      {/* Hata */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {/* 2. sıra */}
              {top3[1] ? (
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all ${
                    top3[1].isMe
                      ? 'bg-yellow-500/10 border-yellow-500/40'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <Medal className="w-4 h-4 text-white" />
                  </div>
                  <Avatar name={top3[1].name} />
                  <p className="text-white text-sm font-semibold text-center truncate w-full">
                    {top3[1].name}
                    {top3[1].isMe && (
                      <span className="ml-1 text-yellow-400 text-xs">(Sen)</span>
                    )}
                  </p>
                  <p className="text-gray-300 font-bold tabular-nums">
                    {top3[1].points.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-gray-500 text-xs">puan</p>
                </div>
              ) : (
                <div />
              )}

              {/* 1. sıra — ortada ve daha büyük */}
              {top3[0] && (
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 border -mt-4 shadow-lg transition-all ${
                    top3[0].isMe
                      ? 'bg-yellow-500/15 border-yellow-500/50'
                      : 'bg-gray-900 border-yellow-500/30'
                  }`}
                >
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <Avatar name={top3[0].name} />
                  <p className="text-white text-sm font-bold text-center truncate w-full">
                    {top3[0].name}
                    {top3[0].isMe && (
                      <span className="ml-1 text-yellow-400 text-xs">(Sen)</span>
                    )}
                  </p>
                  <p className="text-yellow-300 font-bold text-lg tabular-nums">
                    {top3[0].points.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-gray-500 text-xs">puan</p>
                </div>
              )}

              {/* 3. sıra */}
              {top3[2] ? (
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all ${
                    top3[2].isMe
                      ? 'bg-yellow-500/10 border-yellow-500/40'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center">
                    <Medal className="w-4 h-4 text-white" />
                  </div>
                  <Avatar name={top3[2].name} />
                  <p className="text-white text-sm font-semibold text-center truncate w-full">
                    {top3[2].name}
                    {top3[2].isMe && (
                      <span className="ml-1 text-yellow-400 text-xs">(Sen)</span>
                    )}
                  </p>
                  <p className="text-gray-300 font-bold tabular-nums">
                    {top3[2].points.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-gray-500 text-xs">puan</p>
                </div>
              ) : (
                <div />
              )}
            </div>
          )}

          {/* 4+ Sıra Listesi */}
          {rest.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium w-12">#</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium">Kullanıcı</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium text-right">
                      <Trophy className="w-3.5 h-3.5 inline mr-1 text-yellow-500" />
                      Puan
                    </th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium text-right hidden sm:table-cell">
                      <Play className="w-3.5 h-3.5 inline mr-1" />
                      Video
                    </th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium text-right hidden sm:table-cell">
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      İzleme
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-800 last:border-0 transition-colors ${
                        entry.isMe
                          ? 'bg-yellow-500/8 hover:bg-yellow-500/12'
                          : 'hover:bg-gray-800/40'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <RankBadge rank={entry.rank} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={entry.name} />
                          <span
                            className={`text-sm font-medium ${
                              entry.isMe ? 'text-yellow-300' : 'text-white'
                            }`}
                          >
                            {entry.name}
                            {entry.isMe && (
                              <span className="ml-1.5 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                                Sen
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-yellow-300 font-bold tabular-nums text-sm">
                          {entry.points.toLocaleString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-sm tabular-nums hidden sm:table-cell">
                        {entry.videoCount}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-sm tabular-nums hidden sm:table-cell">
                        {entry.watchCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.leaderboard.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Henüz kullanıcı yok.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
