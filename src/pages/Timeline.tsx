import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase, hasSupabaseEnv } from '../lib/supabase';
import { Post } from '../types';
import { Button } from '../components/ui/Button';
import { Hand, Map as MapIcon, List, MapPin } from 'lucide-react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { ImpactBubble } from '../components/ui/ImpactBubble';
import { ScreenshotGuard } from '../components/ui/ScreenshotGuard';
import { useAuth } from '../contexts/AuthContext';

// Fix Leaflet default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return;
    }
    fetchPosts();
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    if (!hasSupabaseEnv || !supabase) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const handleShibaku = async (postId: string) => {
    // Optimistic update
    setPosts(posts.map(p => p.id === postId ? { ...p, shibaku_count: p.shibaku_count + 1 } : p));

    if (!hasSupabaseEnv || !supabase) return;
    await supabase.from('shibaku_logs').insert({ post_id: postId, count: 1 });
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-red-600" />
          みんなのハプニングマップ
        </h2>
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button
            className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white shadow-sm text-red-600' : 'text-zinc-500'}`}
            onClick={() => setViewMode('map')}
          >
            <MapIcon className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-zinc-500'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border-4 border-zinc-900 shadow-xl bg-zinc-50">
        {viewMode === 'map' ? (
          // @ts-ignore
          <MapContainer center={[38.0, 137.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              {...({ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } as any)}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {posts.map((post) => (
              post.latitude && post.longitude && (
                <Marker key={post.id} position={[post.latitude, post.longitude]}>

                  <Popup>
                    <div className="min-w-[240px] p-2">
                      <ImpactBubble variant="black" spikeIntensity="low" className="mb-2 text-sm py-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </ImpactBubble>
                      {post.media_url && (
                        <ScreenshotGuard className="mb-3 border-2 border-black rounded-lg overflow-hidden shadow-lg">
                          <div className="relative">
                            <img src={post.media_url} alt="Happen" className="w-full h-40 object-cover" />
                          </div>
                        </ScreenshotGuard>
                      )}
                      <p className="text-lg font-black mb-4 text-center">{post.content}</p>
                      <Button size="sm" onClick={() => handleShibaku(post.id)} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-4 shadow-md active:translate-y-1 active:shadow-none transition-all">
                        <Hand className="w-5 h-5" /> 叩く! ({post.shibaku_count})
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-6 bg-zinc-100">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-zinc-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-zinc-400">
                    {post.latitude ? `Lat: ${post.latitude.toFixed(2)}, Lng: ${post.longitude?.toFixed(2)}` : '位置情報なし'}
                  </span>
                </div>
                {post.media_url && (
                  <ScreenshotGuard className="relative mb-3 rounded-lg overflow-hidden border-2 border-black shadow-md">
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} className="w-full h-56 object-cover" controls />
                    ) : (
                      <img src={post.media_url} alt="Happen" className="w-full h-56 object-cover" />
                    )}
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 font-bold rounded shadow-sm opacity-90 pointer-events-none">
                      スクショ禁止
                    </div>
                  </ScreenshotGuard>
                )}
                <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
                  <p className="font-black text-lg text-zinc-900">{post.content}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleShibaku(post.id)}
                    className="flex items-center gap-2 font-black shadow-sm active:translate-y-[1px]"
                  >
                    <Hand className="w-4 h-4" />
                    <span>しばく! {post.shibaku_count}</span>
                  </Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-20 text-zinc-400 flex flex-col items-center">
                <div className="text-6xl mb-4">💤</div>
                <p className="font-bold">まだハプニングはありません。</p>
                <p className="text-sm">平和ですね... それとも？</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
