import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ImpactBubble } from '../components/ui/ImpactBubble';
import { supabase, hasSupabaseEnv } from '../lib/supabase';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Star, Target, Circle, Heart } from 'lucide-react';

interface GameState {
  isPlaying: boolean;
  timeLeft: number;
  count: number;
  isFinished: boolean;
}

const SHIBAKU_WORDS = ['バシッ!', 'ドカッ!', 'オラァ!', 'シバく!', 'ドン!', 'ゴッ!', '消えろ!', 'うぉぉ!'];

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInAnonymously } = useAuth();

  const customDuration = location.state?.duration || 30;

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    timeLeft: customDuration,
    count: 0,
    isFinished: false,
  });

  // Custom image passed from Post page or other source
  const customImage = location.state?.imageUrl;
  const postId = location.state?.postId;

  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; word: string; rotation: number; scale: number }[]>([]);
  const clickIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [targetTransform, setTargetTransform] = useState({ scale: 1, rotate: 0, x: 0, y: 0 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0 && gameState.isPlaying) {
      finishGame();
    }
    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.timeLeft]);

  const startGame = () => {
    setGameState({
      isPlaying: true,
      timeLeft: customDuration,
      count: 0,
      isFinished: false,
    });
  };

  const handleShibaku = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gameState.isPlaying) return;

    setGameState((prev) => ({ ...prev, count: prev.count + 1 }));

    // Visual effect coordinates
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // --- CHAOS MODE EFFECTS ---

    // 1. Multiple Text Effects (Scatter)
    const newClicks = [];
    const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 effects per tap
    for (let i = 0; i < count; i++) {
      const id = clickIdRef.current++;
      const word = SHIBAKU_WORDS[Math.floor(Math.random() * SHIBAKU_WORDS.length)];
      const rotation = Math.random() * 120 - 60; // -60 to 60 deg (More rotation)
      const scale = 1.5 + Math.random() * 2.5; // 1.5 to 4.0 (Bigger)
      // Scatter position slightly
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 100;

      newClicks.push({ id, x: clientX + offsetX, y: clientY + offsetY, word, rotation, scale });
    }
    setClicks((prev) => [...prev, ...newClicks]);

    // 2. Screen Flash
    const flashColors = ['bg-red-500/30', 'bg-yellow-500/30', 'bg-white/50', 'bg-black/30', 'invert'];
    const randomFlash = flashColors[Math.floor(Math.random() * flashColors.length)];
    setBackgroundColor(randomFlash);
    setTimeout(() => setBackgroundColor(''), 100); // Reset quickly

    // 3. Target Distortion (Squash & Stretch & Shake)
    setTargetTransform({
      scale: 0.8 + Math.random() * 0.4, // 0.8 - 1.2
      rotate: Math.random() * 40 - 20,  // -20 - 20 deg
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10
    });
    setTimeout(() => setTargetTransform({ scale: 1, rotate: 0, x: 0, y: 0 }), 150);

    // 4. Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([50, 20, 50]); // Double tap vibration
    }

    // 5. Container Shake
    if (containerRef.current) {
      containerRef.current.classList.remove('shake-hard');
      void containerRef.current.offsetWidth; // trigger reflow
      containerRef.current.classList.add('shake-hard');
    }

    // Cleanup clicks
    setTimeout(() => {
      const idsToRemove = newClicks.map(c => c.id);
      setClicks((prev) => prev.filter((c) => !idsToRemove.includes(c.id)));
    }, 800);
  };


  const finishGame = async () => {
    setGameState((prev) => ({ ...prev, isPlaying: false, isFinished: true }));

    // Save score to leaderboard
    if (hasSupabaseEnv && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // Save to the new game_scores table
        await supabase.from('game_scores').insert({
          score: gameState.count,
          duration: customDuration,
          nickname: user?.user_metadata?.full_name || '名無しのしばき屋',
          user_id: user?.id
        });

        // Also update shibaku_logs if it's a specific post
        if (postId) {
          await supabase.from('shibaku_logs').insert({
            count: gameState.count,
            post_id: postId,
          });
        }
      } catch (error) {
        console.error('Failed to save score:', error);
      }
    }
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      timeLeft: customDuration,
      count: 0,
      isFinished: false,
    });
  };

  const getRankInfo = (count: number) => {
    if (count >= 150) return { label: '神レベル', icon: <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (count >= 100) return { label: '達人レベル', icon: <Star className="w-16 h-16 text-zinc-400 animate-pulse" />, color: 'text-zinc-600', bg: 'bg-zinc-50' };
    if (count >= 50) return { label: '玄人レベル', icon: <Target className="w-16 h-16 text-orange-600" />, color: 'text-orange-700', bg: 'bg-orange-50' };
    if (count >= 20) return { label: '凡人レベル', icon: <Circle className="w-16 h-16 text-blue-500" />, color: 'text-blue-600', bg: 'bg-blue-50' };
    return { label: '初心者レベル', icon: <Heart className="w-16 h-16 text-zinc-300" />, color: 'text-zinc-400', bg: 'bg-zinc-50' };
  };

  if (gameState.isFinished) {
    const rank = getRankInfo(gameState.count);
    return (
      <div className={clsx("flex flex-col items-center justify-center space-y-8 py-10 h-full animate-in fade-in zoom-in duration-500", rank.bg)}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-6 bg-white rounded-full shadow-2xl border-4 border-black relative">
            {rank.icon}
            <div className="absolute -top-4 -right-4">
              <ImpactBubble variant="yellow" className="text-xl">RANK!</ImpactBubble>
            </div>
          </div>
          <h2 className={clsx("text-4xl font-black italic impact-text", rank.color)}>{rank.label}</h2>
        </motion.div>

        <div className="text-center">
          <p className="text-zinc-500 mb-2 font-bold">あなたのしばき回数</p>
          <div className="relative inline-block">
            <div className="absolute -inset-8 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <motion.p
              className="relative text-9xl font-black text-red-600 drop-shadow-2xl impact-text italic tracking-tighter"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {gameState.count}
            </motion.p>
            <p className="font-black text-2xl text-red-800 italic text-right -mt-4">Hits!</p>
          </div>
        </div>

        <div className="w-full space-y-4 px-6">
          <Button onClick={resetGame} variant="secondary" className="w-full text-xl py-6 border-2 border-zinc-800 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            もう一度しばく
          </Button>
          <Button onClick={() => navigate('/')} variant="ghost" className="w-full text-lg">
            ホームへ戻る
          </Button>
          <Button onClick={() => navigate('/ranking')} className="w-full text-xl py-6 bg-yellow-400 hover:bg-yellow-500 text-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            ランキングを見る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={clsx("flex flex-col items-center h-[85vh] relative overflow-hidden bg-pattern transition-colors duration-75", backgroundColor)}>
      <div className="w-full flex justify-between items-center mb-6 px-4 pt-4 z-10">
        <div className={clsx("text-4xl font-black font-mono", gameState.timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-zinc-900")}>
          {gameState.timeLeft.toString().padStart(2, '0')}<span className="text-sm">s</span>
        </div>
        <div className="text-3xl font-black text-red-600 italic impact-text tracking-tighter">
          {gameState.count} HITS
        </div>
      </div>

      {!gameState.isPlaying ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
          <div className="mb-8 relative w-72 h-72 flex items-center justify-center">
            {customImage ? (
              <div className="relative w-full h-full">
                <img src={customImage} alt="Target" className="w-full h-full object-cover rounded-3xl shadow-2xl opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-red-500 mix-blend-overlay opacity-20"></div>
              </div>
            ) : (
              <div className="w-full h-full bg-zinc-100 rounded-full flex items-center justify-center border-8 border-dashed border-zinc-300 animate-[spin_10s_linear_infinite]">
                <span className="text-zinc-300 font-black text-xl rotate-12">SHIBAKU?</span>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={startGame}
                size="lg"
                className="text-4xl px-12 py-12 rounded-full shadow-[8px_8px_0px_0px_#000] bg-yellow-400 hover:bg-yellow-300 text-black font-black animate-bounce border-4 border-black"
              >
                START!
              </Button>
            </div>
          </div>
          <p className="font-bold text-zinc-500 mt-4">ストレスをぶつけろ！</p>
        </div>
      ) : (
        <div
          className="flex-1 w-full flex items-center justify-center relative touch-manipulation select-none z-10"
          onClick={handleShibaku}
        >
          {customImage ? (
            <div className="w-full h-full p-4" style={{
              transform: `scale(${targetTransform.scale}) rotate(${targetTransform.rotate}deg) translate(${targetTransform.x}px, ${targetTransform.y}px)`,
              transition: 'transform 0.05s ease-out'
            }}>
              <img
                src={customImage}
                alt="Target"
                className="w-full h-full object-cover rounded-2xl shadow-inner border-4 border-red-600"
              />
            </div>
          ) : (
            <div
              className="w-72 h-72 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,0,0,0.6)] border-8 border-black relative overflow-hidden group"
              style={{
                transform: `scale(${targetTransform.scale}) rotate(${targetTransform.rotate}deg) translate(${targetTransform.x}px, ${targetTransform.y}px)`,
                transition: 'transform 0.05s ease-out'
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
              <span className="text-white font-black text-6xl select-none impact-text rotate-[-5deg] group-active:rotate-[5deg] transition-transform">しばく!</span>
            </div>
          )}

          <AnimatePresence>
            {clicks.map((click) => (
              <motion.div
                key={click.id}
                initial={{ opacity: 1, scale: 0.2, rotate: click.rotation }}
                animate={{ opacity: 0, scale: click.scale, y: -100 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute pointer-events-none z-50 drop-shadow-[2px_2px_0px_#000]"
                style={{
                  position: 'fixed',
                  left: click.x,
                  top: click.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <ImpactBubble variant={click.id % 2 === 0 ? 'red' : 'yellow'} spikeIntensity="high" className="text-3xl min-w-[120px]">
                  {click.word}
                </ImpactBubble>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {gameState.isPlaying && (
        <div className="absolute bottom-10 text-red-600 text-2xl font-black animate-pulse impact-text tracking-widest w-full text-center bg-white/80 py-2">
          連打!!! 連打!!! 連打!!!
        </div>
      )}
    </div>
  );
};
