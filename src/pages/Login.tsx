// Force build to ensure latest UI is deployed
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, nickname);
        alert('サインアップが完了しました！');
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || '認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-4 border-black">
        <div className="text-center">
          <h2 className="text-3xl font-black text-red-600 impact-text italic uppercase">SHIBAKU!!</h2>
          <p className="mt-2 text-zinc-600 font-bold">
            {isSignUp ? '新しくアカウントを作成' : 'アカウントにログイン'}
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-3 py-4 border-4 border-black placeholder-zinc-500 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                placeholder="ニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="email"
              required
              className="w-full pl-10 pr-3 py-4 border-4 border-black placeholder-zinc-500 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-3 py-4 border-4 border-black placeholder-zinc-500 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-xl bg-red-600 hover:bg-red-700 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all font-black uppercase italic"
          >
            {loading ? '処理中...' : isSignUp ? 'SIGN UP' : 'LOGIN'}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-zinc-500 hover:text-red-600 transition-colors"
          >
            {isSignUp ? 'すでにアカウントをお持ちですか？ ログイン' : 'アカウントをお持ちでないですか？ サインアップ'}
          </button>
        </div>
      </div>
    </div>
  );
};
