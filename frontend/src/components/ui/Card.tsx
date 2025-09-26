/**
 * Card Component
 * Reusable card component with consistent styling
 */

'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-[#29104A] border border-[#522C5D] rounded-xl shadow-lg
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};