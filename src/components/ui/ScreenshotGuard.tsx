import React, { useEffect } from 'react';
import { clsx } from 'clsx';

interface ScreenshotGuardProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

export const ScreenshotGuard: React.FC<ScreenshotGuardProps> = ({ 
  children, 
  className,
  enabled = true 
}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Attempt to detect PrintScreen key (not always blockable but good for UX)
      if (e.key === 'PrintScreen') {
        alert('スクショ禁止だにゃ！💢');
        // Briefly hide content?
        document.body.style.visibility = 'hidden';
        setTimeout(() => {
          document.body.style.visibility = 'visible';
        }, 1000);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Optional: alert('保存はできないよ！');
    };

    window.addEventListener('keydown', handleKeyDown);
    // document.addEventListener('contextmenu', handleContextMenu); // Be careful with this, might be annoying

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <div className={clsx("relative overflow-hidden group no-screenshot", className)} onContextMenu={(e) => e.preventDefault()}>
      {children}
      {/* Visual Deterrent Overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <div className="absolute inset-0 watermark-pattern opacity-50 mix-blend-multiply"></div>
      </div>
      
      {/* Always visible faint watermark - Increased opacity */}
      <div className="absolute inset-0 z-40 pointer-events-none watermark-pattern opacity-40 mix-blend-multiply"></div>
    </div>
  );
};
