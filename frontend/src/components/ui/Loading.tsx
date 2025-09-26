/**
 * Loading Component
 * Shows loading spinner with chess theme
 */

'use client';

import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Chess piece spinner */}
        <div className="absolute inset-0 animate-spin">
          <div className="text-[#E38681] text-2xl font-bold">♔</div>
        </div>
      </div>
      {message && (
        <p className="text-[#FFE3D8] text-sm font-medium">{message}</p>
      )}
    </div>
  );
};