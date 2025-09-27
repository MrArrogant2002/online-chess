/**
 * Button Component
 * Reusable button component with consistent styling
 */

'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    btn-modern relative overflow-hidden font-semibold 
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    disabled:hover:shadow-none
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-purple-600 to-indigo-600 text-white
      hover:from-purple-500 hover:to-indigo-500
      focus-visible:ring-purple-500 focus-visible:ring-offset-slate-900
      shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
    `,
    secondary: `
      bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100
      hover:from-slate-600 hover:to-slate-700
      focus-visible:ring-slate-500 focus-visible:ring-offset-slate-900
      shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40
      border border-slate-600/50 hover:border-slate-500/70
    `,
    outline: `
      bg-transparent border-2 border-purple-500/70 text-purple-400
      hover:bg-purple-500/10 hover:border-purple-400 hover:text-purple-300
      focus-visible:ring-purple-500 focus-visible:ring-offset-slate-900
      backdrop-blur-sm hover:backdrop-blur-md
      shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-rose-600 text-white
      hover:from-red-500 hover:to-rose-500
      focus-visible:ring-red-500 focus-visible:ring-offset-slate-900
      shadow-lg shadow-red-500/25 hover:shadow-red-500/40
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};