'use client';

/**
 * /admin — Admin Paneli
 * Sadece ADMIN_EMAIL env değişkenindeki email ile giriş yapan kullanıcı görebilir.
 * - Tüm kullanıcıları listele, puan ekle/çıkar, kullanıcı sil
 * - Tüm videoları listele, aktiflik toggle, video sil
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Video, Plus, Minus, Trash2, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  points: number;
  createdAt: string;
  _count: { videos: number; watchSessions: number };
}

interface AdminVideo {
  id: string;
  title: string;
  youtubeId: string;
  isActive: boolean;
  totalViews: number;
  costPoints: number;
  createdAt: string;
  owner: { id: string; email: string; name: string };
  _count: { watchSessions: number };
}

type Tab = 'users' | 'videos';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Puan ekleme modalı state
  const [pointModal, setPointModal] = useState<{ userId: string; userName: string } | null>(null);
  const [pointAmount, setPointAmount] = useState('');
  const [pointReason, setPointReason] = useState('');
  const [pointLoading, setPointLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      if (activeTab === 'users') fetchUsers();
      else fetchVideos();
    }
  }, [activeTab, status]);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        setError('Bu sayfaya erişim yetkiniz yok.');
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError('Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchVideos() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/videos');
      if (res.status === 403) {
        setError('Bu sayfaya erişim yetkiniz yok.');
        return;
      }
      const data = await res.json();
      setVideos(data.videos || []);
    } catch {
      setError('Videolar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPoints() {
    if (!pointModal || !pointAmount) return;
    const amount = parseInt(pointAmount);
    if (isNaN(amount) || amount === 0) return;

    setPointLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pointModal.userId,
          points: amount,
          reason: pointReason || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => (u.id === pointModal.userId ? { ...u, points: data.user.points } : u))
        );
        setPointModal(null);
        setPointAmount('');
        setPointReason('');
      }
    } finally {
      setPointLoading(false);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`"${userName}" kullanıcısını silmek istediğine emin misin? Bu işlem geri alınamaz.`))
      return;

    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  }

  async function handleToggleVideo(videoId: string, currentActive: boolean) {
    const res = await fetch('/api/admin/videos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, isActive: !currentActive }),
    });
    if (res.ok) {
      setVideos(prev =>
        prev.map(v => (v.id === videoId ? { ...v, isActive: !currentActive } : v))
      );
    }
  }

  async function handleDeleteVideo(videoId: string, videoTitle: string) {
    if (!confirm(`"${videoTitle}" videosunu silmek istediğine emin misin?`)) return;

    const res = await fetch(`/api/admin/videos?videoId=${videoId}`, { method: 'DELETE' });
    if (res.ok) {
      setVideos(prev => prev.filter(v => v.id !== videoId));
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold">Admin Paneli</h1>
          </div>
          <span className="text-sm text-gray-400">{session?.user?.email}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Kullanıcılar ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Video className="w-4 h-4" />
            Videolar ({videos.length})
          </button>
          <button
            onClick={() => activeTab === 'users' ? fetchUsers() : fetchVideos()}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">E-posta</th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">Puan</th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">Videolar</th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">İzlemeler</th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Henüz kayıtlı kullanıcı yok.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium">{user.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-yellow-400">{user.points.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">{user._count.videos}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{user._count.watchSessions}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPointModal({ userId: user.id, userName: user.name })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Puan
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 bg-red-800 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Video</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Sahip</th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">Görüntülenme</th>
                  <th className="text-center px-4 py-3 text-sm text-gray-400 font-medium">Durum</th>
                  <th className="text-right px-4 py-3 text-sm text-gray-400 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto" />
                    </td>
                  </tr>
                ) : videos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      Henüz video yok.
                    </td>
                  </tr>
                ) : (
                  videos.map(video => (
                    <tr key={video.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                            alt=""
                            className="w-12 h-9 object-cover rounded"
                          />
                          <span className="font-medium text-sm line-clamp-1 max-w-xs">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{video.owner.name}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{video._count.watchSessions}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          video.isActive
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                          {video.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleVideo(video.id, video.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              video.isActive
                                ? 'bg-yellow-700 hover:bg-yellow-600'
                                : 'bg-green-700 hover:bg-green-600'
                            }`}
                            title={video.isActive ? 'Pasife Al' : 'Aktife Al'}
                          >
                            {video.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id, video.title)}
                            className="p-1.5 bg-red-800 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Puan Ekleme Modalı */}
      {pointModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-1">Puan Düzenle</h2>
            <p className="text-gray-400 text-sm mb-5">
              <span className="text-white font-medium">{pointModal.userName}</span> için puan ekle veya çıkar.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Puan Miktarı <span className="text-xs">(eklemek için pozitif, çıkarmak için negatif)</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPointAmount(v => String((parseInt(v) || 0) - 50))}
                    className="px-3 py-2 bg-red-900 hover:bg-red-800 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={pointAmount}
                    onChange={e => setPointAmount(e.target.value)}
                    placeholder="örn: 100 veya -50"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => setPointAmount(v => String((parseInt(v) || 0) + 50))}
                    className="px-3 py-2 bg-green-900 hover:bg-green-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Hızlı seçenekler */}
                <div className="flex gap-2 mt-2">
                  {[50, 100, 200, 500, 1000].map(v => (
                    <button
                      key={v}
                      onClick={() => setPointAmount(String(v))}
                      className="flex-1 text-xs py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Açıklama (opsiyonel)</label>
                <input
                  type="text"
                  value={pointReason}
                  onChange={e => setPointReason(e.target.value)}
                  placeholder="örn: Bonus kampanyası"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setPointModal(null); setPointAmount(''); setPointReason(''); }}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddPoints}
                disabled={pointLoading || !pointAmount || pointAmount === '0'}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {pointLoading ? 'Kaydediliyor...' : 'Uygula'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
