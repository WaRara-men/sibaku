import React from 'react';
import { Button } from './Button';

export const InstallButton: React.FC = () => {
  return (
    <div className="w-full">
      <Button className="w-full bg-zinc-900 text-white font-bold py-3" onClick={() => {}}>
        ホーム画面に追加（ブラウザのメニューから）
      </Button>
    </div>
  );
};
