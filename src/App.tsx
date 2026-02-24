import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { Post } from './pages/Post';
import { Timeline } from './pages/Timeline';
import { Ranking } from './pages/Ranking';
import { Login } from './pages/Login';
import { hasSupabaseEnv } from './lib/supabase';

function App() {
  if (!hasSupabaseEnv) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">環境変数が不足しています</h1>
        <p className="text-center px-4">VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください</p>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="game" element={<Game />} />
        <Route path="post" element={<Post />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="ranking" element={<Ranking />} />
      </Route>
    </Routes>
  );
}

export default App;
