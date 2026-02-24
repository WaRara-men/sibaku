import React, { useEffect, useState } from 'react';
import { supabase, hasSupabaseEnv } from '../lib/supabase';
import { Post } from '../types';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

export const Ranking: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return;
    }
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('shibaku_count', { ascending: false })
      .limit(10);
    
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center items-center h-full text-2xl font-black animate-pulse">読み込み中...</div>;

  return (
    <div className="flex flex-col h-full flex-1 px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-bounce" />
        <h2 className="text-3xl font-black text-zinc-900 tracking-tighter italic">しばかれランキング</h2>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => {
          const isTop3 = index < 3;
          return (
            <div 
              key={post.id} 
              className={clsx(
                "relative bg-white p-4 rounded-xl border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1",
                isTop3 ? "border-yellow-500" : "border-black"
              )}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-black text-xl border-2 border-white shadow-md z-10">
                {index + 1}
              </div>
              
              <div className="ml-6 flex gap-4 items-start">
                {post.media_url && (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-zinc-200">
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={post.media_url} alt="post" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="font-bold text-zinc-800 line-clamp-2 text-lg mb-2">{post.content || '（コメントなし）'}</p>
                  <div className="flex items-center gap-2 text-red-600 font-black text-xl">
                    <TrendingUp className="w-5 h-5" />
                    <span>{post.shibaku_count.toLocaleString()} SHIBAKU</span>
                  </div>
                </div>

                {isTop3 && (
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 absolute top-2 right-2 animate-spin-slow" />
                )}
              </div>
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-10 text-zinc-500 font-bold bg-zinc-100 rounded-xl border-2 border-dashed border-zinc-300">
            まだ誰もランキングに入っていません...<br/>
            あなたが最初のレジェンドになるチャンス！
          </div>
        )}
      </div>
    </div>
  );
};
