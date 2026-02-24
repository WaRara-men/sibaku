import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Map, PlusCircle, Trophy, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'ホーム', path: '/' },
    { icon: Map, label: 'マップ', path: '/timeline' },
    { icon: PlusCircle, label: '投稿', path: '/post' },
    { icon: Trophy, label: 'ランク', path: '/ranking' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="text-xl font-black text-red-600 tracking-tighter">
          しばく！！
        </Link>
        <button className="p-2 rounded-full hover:bg-zinc-100">
          <Settings className="w-5 h-5 text-zinc-600" />
        </button>
      </header>

      <main className="flex-1 flex flex-col container mx-auto px-4 py-6 max-w-md w-full">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-50 bg-white border-t border-zinc-200 px-6 py-2 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                    isActive ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'
                  )}
                >
                  <Icon className={clsx('w-6 h-6', isActive && 'fill-current')} />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
