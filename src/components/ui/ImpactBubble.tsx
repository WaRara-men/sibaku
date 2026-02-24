import React from 'react';

type Props = {
  text?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: string;
  spikeIntensity?: string;
};

export const ImpactBubble: React.FC<Props> = ({ text, className, children }) => {
  return (
    <span className={className || 'inline-block px-2 py-1 bg-red-600 text-white rounded'}>
      {children ?? text ?? 'バシッ!'}
    </span>
  );
};
