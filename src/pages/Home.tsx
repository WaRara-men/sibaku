import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Hand, MessageSquareWarning, ImagePlus } from 'lucide-react';
import { InstallButton } from '../components/ui/InstallButton';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [duration, setDuration] = useState<number>(30);

  const handleCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      navigate('/game', { state: { imageUrl, duration } });
    }
  };

  // Auto sign-in logic is handled in AuthContext now, so user is ready to play immediately.

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-4">
      {/* Top Image */}
      <div className="w-full max-w-sm mb-6 animate-in fade-in zoom-in duration-500">
        <img src="/assets/top.png" alt="しばく！！" className="w-full h-auto object-contain drop-shadow-xl" />
      </div>

      <div className="w-full space-y-4 px-4">
        <InstallButton />
        
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-4 border-black flex flex-col items-center space-y-4">
          <h2 className="text-xl font-black text-center">ストレス発散する？</h2>
          
          <div className="w-full flex justify-center gap-2 mb-2">
            {[10, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setDuration(sec)}
                className={`flex-1 py-3 px-2 rounded-xl text-lg font-black border-2 transition-all duration-200 ${
                  duration === sec 
                    ? 'bg-red-600 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -translate-y-1' 
                    : 'bg-white border-zinc-300 text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {sec}秒
              </button>
            ))}
          </div>

          <Button 
            size="lg" 
            className="w-full text-2xl py-6 bg-yellow-400 hover:bg-yellow-300 text-black border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
            onClick={() => navigate('/game', { state: { duration } })}
          >
            START!
          </Button>
          
          <div className="relative w-full">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCustomImage}
            />
            <Button 
                variant="ghost" 
                className="w-full text-zinc-600 font-bold text-sm flex items-center justify-center gap-2 mt-2 hover:bg-zinc-100"
                onClick={() => fileInputRef.current?.click()}
            >
                <ImagePlus className="w-4 h-4" />
                <span>写真を選んでしばく</span>
            </Button>
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="w-full border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          onClick={() => navigate('/post')}
        >
          <MessageSquareWarning className="w-5 h-5 mr-2" />
          ハプニングを報告する
        </Button>
      </div>
    </div>
  );
};
