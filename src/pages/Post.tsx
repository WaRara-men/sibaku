import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Upload, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase, hasSupabaseEnv } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Post: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleLocationClick = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('位置情報の取得に失敗しました。');
          setIsLocating(false);
        }
      );
    } else {
      alert('お使いのブラウザは位置情報をサポートしていません。');
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !content) {
      alert('写真または内容を入力してください。');
      return;
    }

    if (!user?.user_metadata?.full_name) {
      alert('投稿するにはニックネームが必要です');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (file && hasSupabaseEnv && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file);

        if (uploadError) {
           console.error('Upload error:', uploadError);
           // Fallback: If upload fails (e.g. bucket permission), we might skip or alert.
           // For now, let's alert but proceed if user wants (or stop).
           // Actually, if upload fails, we can't get public URL.
           // Let's try to proceed without image if upload fails, or just throw.
           throw uploadError;
        }

        const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
        mediaUrl = data.publicUrl;
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }

      if (!hasSupabaseEnv || !supabase) {
        alert('オンライン機能が未設定のため投稿は保存されません。');
        navigate('/timeline');
        return;
      }
      // Anonymous auth check: if user is not logged in, we might need to sign in anonymously first?
      // Or if we allowed anon insert in RLS.
      // My migration allowed anon select, but only authenticated insert for posts.
      // I should sign in anonymously if not signed in.
      
      const { data: { session } } = await supabase.auth.getSession();

      const { error: insertError } = await supabase.from('posts').insert({
        content,
        media_url: mediaUrl,
        media_type: mediaType,
        latitude: location?.lat,
        longitude: location?.lng,
      });

      if (insertError) throw insertError;

      alert('投稿しました！');
      navigate('/timeline');
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full py-4">
      <h2 className="text-2xl font-black text-zinc-900 mb-6">情報提供する</h2>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700">
            ハプニングの写真・動画
          </label>
          
          <div 
            className="border-2 border-dashed border-zinc-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors relative overflow-hidden"
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <>
                {file?.type.startsWith('video') ? (
                  <video src={previewUrl} className="w-full h-full object-contain absolute inset-0" controls />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                )}
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-zinc-400 mb-2" />
                <p className="text-zinc-500 text-sm font-medium">タップして撮影・選択</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              capture="environment"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700">
            何があった？
          </label>
          <textarea
            className="w-full p-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[100px] resize-none"
            placeholder="例：信号待ちで割り込みされた！"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center space-x-2 text-zinc-600">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">
              {location ? '位置情報を取得済み' : '位置情報を追加'}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLocationClick}
            disabled={isLocating}
          >
            {isLocating ? '取得中...' : location ? '更新' : '取得'}
          </Button>
        </div>

        <div className="flex-1"></div>

        <Button
          type="submit"
          size="lg"
          className="w-full py-4 text-lg shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? '送信中...' : '投稿する'}
        </Button>
      </form>
    </div>
  );
};
