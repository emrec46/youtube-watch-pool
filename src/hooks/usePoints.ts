/**
 * usePoints.ts
 * Kullanıcının güncel puan bilgisini çeken ve yenileyen hook.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function usePoints() {
  const { data: session } = useSession();
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPoints = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.success) {
        setPoints(data.user.points);
      }
    } catch {
      // sessizce devam et
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return { points, loading, refetch: fetchPoints };
}
