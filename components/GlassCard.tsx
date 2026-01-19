import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};
