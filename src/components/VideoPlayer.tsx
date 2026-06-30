/**
 * VideoPlayer.tsx
 * YouTube IFrame API embed player + izleme süresi takibi.
 * @types/youtube paketi kurulduktan sonra YT global tipi kullanılabilir.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { POINTS } from '@/lib/points';

interface VideoPlayerProps {
  videoId: string;
  dbVideoId: string;
  alreadyRewarded?: boolean;
  onRewarded?: (points: number) => void;
  onEnded?: () => void;
}

// YT global tipi — @types/youtube kurulduktan sonra window.YT olarak erişilir
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YTPlayer = any;

export default function VideoPlayer({
  videoId,
  dbVideoId,
  alreadyRewarded = false,
  onRewarded,
  onEnded,
}: VideoPlayerProps) {
  const playerRef = useRef<YTPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rewardedRef = useRef(alreadyRewarded);

  const [rewarded, setRewarded] = useState(alreadyRewarded);
  const [watchPercent, setWatchPercent] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');

  const sendWatchProgress = useCallback(
    async (watchedSeconds: number, totalSeconds: number) => {
      try {
        const res = await fetch(`/api/videos/${dbVideoId}/watch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ watchedSeconds, totalSeconds }),
        });
        const data = await res.json();
        if (data.rewarded && !rewardedRef.current) {
          rewardedRef.current = true;
          setRewarded(true);
          const earned: number = data.pointsEarned ?? POINTS.WATCH_REWARD;
          setRewardMessage(`+${earned} puan kazandınız! 🎉`);
          onRewarded?.(earned);
        }
      } catch {
        // sessizce devam et
      }
    },
    [dbVideoId, onRewarded]
  );

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTracking = useCallback(() => {
    stopTracking();
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const current: number = player.getCurrentTime?.() ?? 0;
      const duration: number = player.getDuration?.() ?? 0;
      if (duration <= 0) return;

      const percent = Math.round((current / duration) * 100);
      setWatchPercent(Math.min(percent, 100));

      sendWatchProgress(Math.round(current), Math.round(duration));

      if (percent >= POINTS.WATCH_THRESHOLD_PERCENT) {
        stopTracking();
      }
    }, 5000);
  }, [sendWatchProgress, stopTracking]);

  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    const initPlayer = () => {
      if (!containerRef.current || !win.YT?.Player) return;

      playerRef.current = new win.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1, autoplay: 1 },
        events: {
          onStateChange: (event: { data: number }) => {
            const PLAYING = 1;
            const PAUSED = 2;
            const ENDED = 0;
            if (event.data === PLAYING) {
              startTracking();
            } else if (event.data === PAUSED) {
              stopTracking();
            } else if (event.data === ENDED) {
              stopTracking();
              onEndedRef.current?.();
            }
          },
        },
      });
    };

    if (win.YT && win.YT.Player) {
      initPlayer();
    } else {
      // API henüz yüklü değil — script ekle
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      win.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTracking();
      playerRef.current?.destroy?.();
    };
  }, [videoId, startTracking, stopTracking]);

  return (
    <div className="space-y-3">
      {/* Player container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-xl">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* İlerleme çubuğu */}
      {!rewarded && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>İzleme ilerlemesi</span>
            <span>
              {watchPercent}% / {POINTS.WATCH_THRESHOLD_PERCENT}% gerekli
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-yellow-400 transition-all duration-1000 rounded-full"
              style={{ width: `${watchPercent}%` }}
            />
          </div>
          <p className="text-gray-600 text-xs">
            Videoyu %{POINTS.WATCH_THRESHOLD_PERCENT} izleyince +{POINTS.WATCH_REWARD} puan kazanırsınız.
          </p>
        </div>
      )}

      {/* Ödül bildirimi */}
      {rewarded && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-300 font-medium text-sm">
              {rewardMessage || 'Bu video için puan kazandınız ✓'}
            </p>
            <p className="text-green-600 text-xs mt-0.5">
              Aynı video için tekrar puan kazanamazsınız.
            </p>
          </div>
          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}
