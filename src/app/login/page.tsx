/**
 * page.tsx — /login
 * Email + şifre ile giriş formu.
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: form.email.trim(),
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? 'E-posta veya şifre yanlış.' : result.error);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 shadow-lg shadow-red-600/30 mb-4">
            <Play className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
          <p className="text-gray-500 text-sm mt-1">WatchPool hesabına giriş yap</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* E-posta */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="ornek@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          {/* Gönder */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Kayıt linki */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Hesabın yok mu?{' '}
          <Link href="/register" className="text-red-400 hover:text-red-300 font-medium">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </main>
  );
}
