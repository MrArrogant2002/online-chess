/**
 * Input Component
 * Reusable input component with consistent styling
 */

'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[#FFE3D8]">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 bg-[#29104A] border border-[#522C5D] rounded-lg
          text-[#FFE3D8] placeholder-[#845162]
          focus:outline-none focus:ring-2 focus:ring-[#E38681] focus:border-transparent
          transition-colors duration-200
          ${error ? 'border-red-500 ring-2 ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};