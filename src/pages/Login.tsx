import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInAnonymously, updateNickname } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInAnonymously(nickname);
      await updateNickname(nickname);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-4 border-black">
        <div className="text-center">
          <h2 className="text-3xl font-black text-red-600">しばく！！</h2>
          <p className="mt-2 text-zinc-600 font-bold">ニックネームを入力して始める</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nickname" className="sr-only">ニックネーム</label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-4 border-4 border-black placeholder-zinc-500 text-zinc-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-lg font-bold"
                placeholder="ニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xl bg-red-600 hover:bg-red-700 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
            >
              {loading ? '処理中...' : 'はじめる'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
