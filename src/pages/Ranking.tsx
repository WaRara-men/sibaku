import React, { useEffect, useState } from 'react';
import { supabase, hasSupabaseEnv } from '../lib/supabase';
import { Trophy, Star, TrendingUp, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface ScoreEntry {
  id: string;
  nickname: string;
  score: number;
  duration: number;
}

export const Ranking: React.FC = () => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDuration, setActiveDuration] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRanking();
  }, [activeDuration]);

  const fetchRanking = async () => {
    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('game_scores')
      .select('*')
      .eq('duration', activeDuration)
      .order('score', { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error('Fetch ranking error:', fetchError);
      setError('データの取得に失敗しました。RLSの設定を確認してください。');
    } else {
      setScores(data || []);
    }
    setLoading(false);
  };

  const durations = [10, 30, 60];

  return (
    <div className="flex flex-col h-full flex-1 px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-bounce" />
        <h2 className="text-3xl font-black text-zinc-900 tracking-tighter italic uppercase">Leaderboard</h2>
      </div>

      {/* Duration Tabs */}
      <div className="flex gap-2 mb-8 bg-zinc-200/50 p-1.5 rounded-2xl border-2 border-black/5">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDuration(d)}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl font-black transition-all flex items-center justify-center gap-2",
              activeDuration === d
                ? "bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
            )}
          >
            <Clock className="w-4 h-4" />
            {d}s
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {scores.map((entry, index) => {
          const isTop3 = index < 3;
          const medals = ['text-yellow-500', 'text-zinc-400', 'text-orange-400'];

          return (
            <div
              key={entry.id}
              className={clsx(
                "relative bg-white p-5 rounded-2xl border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1",
                isTop3 ? "border-red-600" : "border-black"
              )}
            >
              <div className={clsx(
                "absolute -top-4 -left-3 w-12 h-12 flex items-center justify-center rounded-full font-black text-2xl border-4 border-black shadow-lg z-10",
                isTop3 ? "bg-red-600 text-white" : "bg-white text-black"
              )}>
                {index + 1}
              </div>

              <div className="ml-8 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-zinc-900 truncate">
                    {entry.nickname || '名無しのしばき屋'}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{entry.duration}秒モードでしばいた</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-red-600 impact-text italic">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-black uppercase text-red-800 -mt-1">HITS</div>
                </div>

                {isTop3 && (
                  <Star className={clsx("w-6 h-6 absolute top-2 right-2 animate-pulse", medals[index])} />
                )}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="text-center py-10 px-6 bg-red-50 rounded-3xl border-4 border-red-200 text-red-600 font-bold">
            <p>{error}</p>
            <p className="text-xs mt-2 opacity-70 italic">Supabaseの game_scores テーブルとRLSポリシーが正しく設定されているか確認してください。</p>
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border-4 border-dashed border-zinc-200 space-y-4">
            <div className="flex justify-center">
              <TrendingUp className="w-12 h-12 text-zinc-300" />
            </div>
            <p className="text-zinc-500 font-black text-xlimpact-text italic">ランキングはまだ空です</p>
            <p className="text-zinc-400 font-bold">最初の伝説を刻むチャンス！<br />ホームに戻ってしばき始めよう！</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-zinc-400 italic">ランキング集計中...</p>
          </div>
        )}
      </div>
    </div>
  );
};
